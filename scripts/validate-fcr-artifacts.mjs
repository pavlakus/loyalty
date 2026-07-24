#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const repo = process.cwd();
const root = path.join(repo, 'docs/ai-engineering-framework/fcr');
const indexPath = path.join(root, 'registry.json');
const artifactRoot = path.resolve(root);
const realArtifactRoot = fs.realpathSync(artifactRoot);
const errors = [];
const allJson = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.json')) allJson.push(file);
  }
}
walk(root);

const documents = new Map();
for (const file of allJson) {
  try { documents.set(file, JSON.parse(fs.readFileSync(file, 'utf8'))); }
  catch (error) { errors.push(`${path.relative(repo, file)}: invalid JSON: ${error.message}`); }
}

const schemas = [...documents.entries()].filter(([file, value]) =>
  file.endsWith('.schema.json') && value && value.$schema === 'https://json-schema.org/draft/2020-12/schema');
const schemaIdByFile = new Map(schemas.map(([file, schema]) => [path.resolve(file), schema.$id]));
function normalizeRefs(value, sourceFile) {
  if (Array.isArray(value)) return value.map((item) => normalizeRefs(item, sourceFile));
  if (!value || typeof value !== 'object') return value;
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (key === '$ref' && typeof item === 'string' && !/^[a-z][a-z0-9+.-]*:/i.test(item)) {
      const [target, fragment = ''] = item.split('#', 2);
      if (!target) { output[key] = item; continue; }
      const targetId = schemaIdByFile.get(path.resolve(path.dirname(sourceFile), target));
      if (targetId) output[key] = `${targetId}${fragment ? `#${fragment}` : ''}`;
      else { output[key] = item; errors.push(`${path.relative(repo, sourceFile)}: unresolved repository ref ${item}`); }
    } else output[key] = normalizeRefs(item, sourceFile);
  }
  return output;
}
const normalizedSchemas = schemas.map(([file, schema]) => [file, normalizeRefs(schema, file)]);
const ids = new Map();
for (const [file, schema] of schemas) {
  if (!schema.$id) errors.push(`${path.relative(repo, file)}: missing $id`);
  else if (ids.has(schema.$id)) errors.push(`duplicate $id ${schema.$id}`);
  else ids.set(schema.$id, file);
}

const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: true });
addFormats(ajv);
for (const [, schema] of normalizedSchemas) {
  try { ajv.addSchema(schema); }
  catch (error) { errors.push(`schema compile failure ${schema.$id ?? '<unknown>'}: ${error.message}`); }
}
for (const [file, schema] of normalizedSchemas) {
  try { if (!ajv.validateSchema(schema)) errors.push(`${path.relative(repo, file)}: metaschema validation returned false: ${ajv.errorsText(ajv.errors)}`); }
  catch (error) { errors.push(`${path.relative(repo, file)}: metaschema failure: ${error.message}`); }
}

function validate(file, schemaId, value) {
  const validateFn = ajv.getSchema(schemaId);
  if (!validateFn) { errors.push(`${path.relative(repo, file)}: missing validator ${schemaId}`); return; }
  if (!validateFn(value)) errors.push(`${path.relative(repo, file)}: ${ajv.errorsText(validateFn.errors)}`);
}

const schemaByName = new Map(normalizedSchemas.map(([file, value]) => [path.basename(file), value.$id]));
const registryRelative = 'docs/ai-engineering-framework/fcr/registry.json';
const index = documents.get(indexPath);
const categoryByPath = new Map();
for (const [category, files] of Object.entries(index ?? {})) if (Array.isArray(files)) for (const ref of files) categoryByPath.set(ref, category);
function schemaId(name) { return schemaByName.get(name); }
function mappingFor(relative, value) {
  const base = path.basename(relative);
  const category = categoryByPath.get(relative);
  if (relative === registryRelative) return schemaId('registry-index.schema.json');
  if (base.endsWith('.schema.json')) return null;
  if (category === 'examples') return null;
  if (category === 'contracts' && base.endsWith('.contract.json')) return schemaId('contract-record.schema.json');
  if (category === 'authority_tables') return schemaId('authority-record.schema.json');
  if (category === 'bootstrap_contracts') return schemaId('bootstrap-record.schema.json');
  if (category === 'context_contracts') return schemaId('context-record.schema.json');
  if (category === 'predicates' && base !== 'evidence-evaluation-algorithm.json') return schemaId('evidence-predicate.schema.json');
  if (base === 'evidence-evaluation-algorithm.json') return schemaId('evidence-evaluation-algorithm.schema.json');
  if (base === 'precondition-record-current.json') return schemaId('precondition-record-current.schema.json');
  if (category === 'transition_tables') return schemaId('transition-rule.schema.json');
  if (base === 'framework-error-catalog.json') return schemaId('framework-error-catalog.schema.json');
  return undefined;
}
const mappedNormative = [];
for (const [file, value] of documents) {
  const relative = path.relative(repo, file).split(path.sep).join('/');
  const mapped = mappingFor(relative, value);
  if (mapped === null) continue;
  if (!mapped) { if (!file.endsWith('.schema.json')) errors.push(`${relative}: missing canonical schema mapping`); continue; }
  mappedNormative.push({ relative, schemaId: mapped });
  const base = path.basename(file);
  if (relative.includes('/transitions/') && base !== 'precondition-record-current.json') {
    for (const transition of value.transitions ?? []) validate(file, schemaId('transition-rule.schema.json'), transition);
  } else if (base === 'framework-error-catalog.json') {
    for (const error of value.errors ?? []) validate(file, schemaId('framework-error.schema.json'), error);
  } else validate(file, mapped, value);
}
for (const item of mappedNormative) if (!item.schemaId) errors.push(`${item.relative}: canonical schema mapping is unresolved`);

if (!index) errors.push('registry.json missing');
else {
  const indexed = new Set();
  for (const [category, files] of Object.entries(index)) {
    if (!Array.isArray(files)) continue;
    for (const ref of files) {
      if (indexed.has(ref)) errors.push(`duplicate indexed path ${ref}`);
      indexed.add(ref);
      if (typeof ref !== 'string') { errors.push('indexed path is not a string'); continue; }
      const lexicalPath = path.resolve(repo, ref);
      const lexicalRelative = path.relative(artifactRoot, lexicalPath);
      if (lexicalRelative === '..' || lexicalRelative.startsWith(`..${path.sep}`) || path.isAbsolute(lexicalRelative)) {
        errors.push(`indexed path outside FCR artifact root ${ref}`);
        continue;
      }
      if (!fs.existsSync(lexicalPath)) { errors.push(`indexed file missing ${ref}`); continue; }
      let realPath;
      try { realPath = fs.realpathSync(lexicalPath); }
      catch { errors.push(`indexed file cannot be resolved ${ref}`); continue; }
      const realRelative = path.relative(realArtifactRoot, realPath);
      if (realRelative === '..' || realRelative.startsWith(`..${path.sep}`) || path.isAbsolute(realRelative)) {
        errors.push(`indexed symlink escapes FCR artifact root ${ref}`);
        continue;
      }
      try {
        if (!fs.statSync(realPath).isFile()) errors.push(`indexed target is not a regular file ${ref}`);
      } catch { errors.push(`indexed target cannot be inspected ${ref}`); }
    }
  }
  for (const file of allJson) {
    const ref = path.relative(repo, file);
    if (ref !== 'docs/ai-engineering-framework/fcr/registry.json' && !indexed.has(ref)) errors.push(`unindexed artifact ${ref}`);
  }
}

const operations = new Set();
for (const [file, value] of documents) if (file.endsWith('.contract.json')) {
  const operationIdFromPath = path.basename(file, '.contract.json');
  const contractRelative = path.relative(repo, file).split(path.sep).join('/');
  const contractBase = contractRelative.slice(0, -'.contract.json'.length);
  const expectedRequestSchema = `${contractBase}.request.schema.json`;
  const expectedSuccessSchema = `${contractBase}.success.schema.json`;
  const expectedFailureSchema = `${contractBase}.failure.schema.json`;
  if (value.operation_id !== operationIdFromPath) errors.push(`${contractRelative}: operation_id does not match canonical contract identity ${operationIdFromPath}`);
  for (const [field, expected] of [['request_schema', expectedRequestSchema], ['success_schema', expectedSuccessSchema], ['failure_schema', expectedFailureSchema]]) {
    if (value[field] !== expected) errors.push(`${contractRelative}: ${field} does not match canonical operation identity ${operationIdFromPath}`);
  }
  if (operations.has(value.operation_id)) errors.push(`duplicate operation_id ${value.operation_id}`);
  operations.add(value.operation_id);
}
if (operations.size !== 25) errors.push(`expected 25 operation IDs, found ${operations.size}`);

const actorValues = new Set(['FCR', 'TASK_PREPARATION_AGENT', 'DISPATCHER', 'LIFECYCLE_ACTOR', 'REVIEW_AGENT', 'QA_AGENT', 'SECURITY_AGENT', 'RELEASE_AGENT', 'DEVOPS_AGENT', 'RECOVERY_CONTROLLER', 'AUTHORIZED_ADMINISTRATOR']);
for (const [file, value] of documents) if (file.includes(`${path.sep}transitions${path.sep}`) && value.transitions) {
  for (const transition of value.transitions) {
    if (!actorValues.has(transition.authorized_actor)) errors.push(`${path.relative(repo, file)}: actor is not closed: ${transition.authorized_actor}`);
    if (!(transition.required_preconditions ?? []).includes('docs/ai-engineering-framework/fcr/transitions/precondition-record-current.json')) errors.push(`${path.relative(repo, file)}: missing current-record precondition`);
  }
}

const requiredPrecedenceFields = ['task_identity', 'namespace', 'title', 'slug', 'category', 'module', 'owner', 'role', 'lifecycle', 'implementation_status', 'release_status', 'scope', 'file_ownership', 'dependencies', 'required_documents', 'required_evidence', 'acceptance_criteria', 'mandatory_tests', 'contracts', 'business_behavior', 'architectural_decisions', 'task_metadata', 'legacy_identity', 'repository_identity', 'registry_revision'];
const precedence = documents.get(path.join(root, 'authority/field-precedence.json'));
for (const field of requiredPrecedenceFields) if (!precedence?.fields?.[field]?.ordered_sources?.length) errors.push(`missing field precedence ${field}`);
const authorityClasses = new Set(documents.get(path.join(root, 'authority/authority-classes.json'))?.classes ?? []);
const dependencySources = documents.get(path.join(root, 'authority/dependency-source-precedence.json'))?.ordered_sources ?? [];
for (const source of dependencySources) if (!authorityClasses.has(source)) errors.push(`dependency source is not an authority class: ${source}`);

const contextResponse = documents.get(path.join(root, 'schemas/context-selection-response.schema.json'));
if (JSON.stringify(contextResponse?.properties?.candidates?.items) !== JSON.stringify({ '$ref': './context-candidate.schema.json' })) errors.push('context response candidates are not typed ContextCandidate records');
const snapshot = documents.get(path.join(root, 'schemas/validator-snapshot.schema.json'));
for (const [field, expected] of [['snapshot_worktree_mode', 'TEMPORARY_DETACHED_GIT_WORKTREE'], ['detached_head', true], ['independent_index', true], ['active_transaction_protection', true]]) if (snapshot?.properties?.[field]?.const !== expected) errors.push(`snapshot invariant missing ${field}`);
const matrix = documents.get(path.join(root, 'examples/resolution-matrix.json'));
const requiredFindingIds = [...Array.from({length: 8}, (_, i) => `83-${i + 1}`), ...Array.from({length: 11}, (_, i) => `84-${i + 1}`), ...Array.from({length: 12}, (_, i) => `F${i + 1}`), ...Array.from({length: 12}, (_, i) => `R2-F${i + 1}`), ...Array.from({length: 12}, (_, i) => `R3-F${i + 1}`)];
const findings = new Map((matrix?.findings ?? []).map((finding) => [finding.finding_id, finding]));
for (const id of requiredFindingIds) if (!findings.has(id) || findings.get(id).status !== 'RESOLVED') errors.push(`resolution finding is not RESOLVED: ${id}`);
if (findings.size !== 55) errors.push(`expected 55 resolution findings, found ${findings.size}`);

for (const [operation, script, argumentType] of [['fcr-v2-001-validate-manifest', 'scripts/validate-task-scope-manifest.py', 'manifest_repository_relative_path'], ['fcr-v2-002-validate-scope', 'scripts/validate-task-scope.py', 'task_id'], ['fcr-v2-003-validate-preflight', 'scripts/validate-environment-preflight.py', 'task_id']]) {
  const contract = documents.get(path.join(root, 'contracts', `${operation}.contract.json`));
  if (!fs.existsSync(path.join(repo, script))) errors.push(`validator script missing ${script}`);
  if (contract?.executable !== 'python3' || contract?.script_path !== script || contract?.argument_type !== argumentType) errors.push(`validator contract mismatch ${operation}`);
}

const output = { json_files: allJson.length, schemas: schemas.length, operation_ids: operations.size, errors };
console.log(JSON.stringify(output, null, 2));
process.exitCode = errors.length ? 1 : 0;
