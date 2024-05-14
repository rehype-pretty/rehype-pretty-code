/** @type {import('@changesets/types').ChangelogFunctions['getDependencyReleaseLine']} */
const getDependencyReleaseLine = async (_, dependenciesUpdated) => {
  if (dependenciesUpdated.length === 0) return '';
  const updatedDepenenciesList = dependenciesUpdated.map(
    (dependency) => `\`${dependency.name}@${dependency.newVersion}\``,
  );
  return `- Update dependencies: ${updatedDepenenciesList.join(', ')}`;
};

/** @type {import('@changesets/types').ChangelogFunctions['getReleaseLine']} */
const getReleaseLine = async (changeset) => {
  const [firstLine, ...nextLines] = changeset.summary
    .split('\n')
    .map((l) => l.trimEnd());

  if (!nextLines.length) return `- ${firstLine}`;

  return `- ${firstLine}\n${nextLines.join('\n')}`;
};

module.exports = {
  getDependencyReleaseLine,
  getReleaseLine,
};
