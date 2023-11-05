import { Form, useFormikContext } from 'formik';

import { CustomTemplate } from '@/react/portainer/templates/custom-templates/types';
import { EdgeGroupsSelector } from '@/react/edge/edge-stacks/components/EdgeGroupsSelector';
import { CustomTemplatesVariablesField } from '@/react/portainer/custom-templates/components/CustomTemplatesVariablesField';
import { NameField } from '@/react/edge/edge-stacks/CreateView/NameField';
import { renderTemplate } from '@/react/portainer/custom-templates/components/utils';
import { GitFormModel } from '@/react/portainer/gitops/types';
import { StackType } from '@/react/common/stacks/types';
import { EnvironmentType } from '@/react/portainer/environments/types';

import { Button } from '@@/buttons';
import { FormActions } from '@@/form-components/FormActions';
import { WebEditorForm } from '@@/WebEditorForm';
import { EnvironmentVariablesPanel } from '@@/form-components/EnvironmentVariablesFieldset';

import { EdgeSettingsFieldset } from '../../CreateView/EdgeSettingsFieldset';

import { AdvancedSettings } from './AdvancedSettings';
import { FormValues } from './types';

export function InnerForm({
  gitConfig,
  isLoading,
  templateType,
  templateFile,
  variables,
  onHide,
}: {
  gitConfig?: GitFormModel;
  templateFile: string;
  templateType: CustomTemplate['Type'];
  variables: CustomTemplate['Variables'];
  isLoading: boolean;
  onHide: () => void;
}) {
  const isGit = !!gitConfig;

  const { values, errors, setFieldValue, isValid, setFieldError, setValues } =
    useFormikContext<FormValues>();

  const allowedType =
    templateType === StackType.Kubernetes
      ? EnvironmentType.EdgeAgentOnKubernetes
      : EnvironmentType.EdgeAgentOnDocker;

  return (
    <Form className="form-horizontal">
      <NameField
        value={values.name}
        onChange={(v) => setFieldValue('name', v)}
        errors={errors.name}
      />

      <EdgeGroupsSelector
        horizontal
        value={values.edgeGroupIds}
        error={errors.edgeGroupIds}
        onChange={(value) => setFieldValue('edgeGroupIds', value)}
        isGroupVisible={(group) => group.EndpointTypes.includes(allowedType)}
        required
      />

      <CustomTemplatesVariablesField
        onChange={(value) =>
          setValues((values) => ({
            ...values,
            variables: value,
            fileContent: renderTemplate(templateFile, value, variables),
          }))
        }
        value={values.variables}
        errors={errors.variables}
        definitions={variables}
      />

      <AdvancedSettings label={(isOpen) => getAdvancedLabel(isOpen, !isGit)}>
        <WebEditorForm
          id="custom-template-creation-editor"
          value={values.fileContent}
          onChange={(value) => setFieldValue('fileContent', value)}
          error={errors.fileContent}
          yaml
          placeholder="Define or paste the content of your docker compose file here"
          readonly={isGit}
        >
          <p>
            You can get more information about Compose file format in the
            <a
              href="https://docs.docker.com/compose/compose-file/"
              target="_blank"
              rel="noreferrer"
            >
              {' '}
              official documentation{' '}
            </a>
            .
          </p>
        </WebEditorForm>

        <EnvironmentVariablesPanel
          onChange={(value) => setFieldValue('envVars', value)}
          values={values.envVars}
          errors={errors.envVars}
        />

        <EdgeSettingsFieldset
          values={values.additionalSettings}
          setValues={(newValues) =>
            setFieldValue(
              'additionalSettings',
              typeof newValues === 'function'
                ? newValues(values.additionalSettings)
                : newValues
            )
          }
          fileValues={{
            fileContent: values.fileContent,
          }}
          setFieldError={setFieldError}
          errors={errors.additionalSettings}
          gitConfig={gitConfig}
        />
      </AdvancedSettings>

      <FormActions
        isLoading={isLoading}
        isValid={isValid}
        loadingText="Deployment in progress..."
        submitLabel="Deploy the stack"
      >
        <Button type="reset" onClick={() => onHide()} color="default">
          Hide
        </Button>
      </FormActions>
    </Form>
  );
}

function getAdvancedLabel(isOpen: boolean, editable?: boolean): string {
  if (isOpen) {
    return editable ? 'Hide custom stack' : 'Hide stack';
  }
  return editable ? 'Customize stack' : 'View stack';
}
