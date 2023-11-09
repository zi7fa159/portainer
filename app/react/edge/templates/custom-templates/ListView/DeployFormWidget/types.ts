import { EdgeGroup } from '@/react/edge/edge-groups/types';
import { VariablesFieldValue } from '@/react/portainer/custom-templates/components/CustomTemplatesVariablesField';
import { EdgeTemplateSettings } from '@/react/portainer/templates/custom-templates/types';

import { EnvVarValues } from '@@/form-components/EnvironmentVariablesFieldset';

export interface FormValues {
  name: string;
  edgeGroupIds: Array<EdgeGroup['Id']>;
  variables: VariablesFieldValue;
  fileContent: string;
  additionalSettings?: EdgeTemplateSettings;
  envVars: EnvVarValues;
}
