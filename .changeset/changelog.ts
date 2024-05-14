import type { ChangelogFunctions } from '@changesets/types';

export const getDependencyReleaseLine: ChangelogFunctions['getDependencyReleaseLine'] =
  async (_, dependenciesUpdated) => {
    if (dependenciesUpdated.length === 0) return '';
    const updatedDepenenciesList = dependenciesUpdated.map(
      (dependency) => `\`${dependency.name}@${dependency.newVersion}\``,
    );
    return `- Update dependencies: ${updatedDepenenciesList.join(', ')}`;
  };

export const getReleaseLine: ChangelogFunctions['getReleaseLine'] = async (
  changeset,
) => {
  const [firstLine, ...nextLines] = changeset.summary
    .split('\n')
    .map((l) => l.trimEnd());

  if (!nextLines.length) return `- ${firstLine}`;

  return `- ${firstLine}\n${nextLines.join('\n')}`;
};
