import { Formik } from 'formik';
import { useRouter } from '@uirouter/react';

import { notifySuccess } from '@/portainer/services/notifications';
import {
  CustomTemplate,
  getDefaultEdgeTemplateSettings,
} from '@/react/portainer/templates/custom-templates/types';
import { DeploymentType } from '@/react/edge/edge-stacks/types';
import { useCustomTemplateFile } from '@/react/portainer/templates/custom-templates/queries/useCustomTemplateFile';
import { getVariablesFieldDefaultValues } from '@/react/portainer/custom-templates/components/CustomTemplatesVariablesField';
import { renderTemplate } from '@/react/portainer/custom-templates/components/utils';
import { GitFormModel, toGitFormModel } from '@/react/portainer/gitops/types';
import { StackType } from '@/react/common/stacks/types';
import {
  CreateEdgeStackPayload,
  useCreateEdgeStack,
} from '@/react/edge/edge-stacks/queries/useCreateEdgeStack/useCreateEdgeStack';

import { TemplateLoadError } from './TemplateLoadError';
import { FormValues } from './types';
import { InnerForm } from './InnerForm';
import { useValidation } from './useValidation';

export function DeployForm({
  template,
  unselect,
}: {
  template: CustomTemplate;
  unselect: () => void;
}) {
  const router = useRouter();
  const mutation = useCreateEdgeStack();
  const validation = useValidation(template.Variables);
  const fileContentQuery = useCustomTemplateFile(
    template.Id,
    !!template.GitConfig
  );

  if (!fileContentQuery.data) {
    return null;
  }

  const initVariables = getVariablesFieldDefaultValues(template.Variables);

  const gitConfig: GitFormModel | undefined = template.GitConfig
    ? toGitFormModel(template.GitConfig)
    : undefined;

  const initialValues: FormValues = {
    edgeGroupIds: [],
    name: template.Title || '',
    variables: initVariables,
    fileContent: renderTemplate(
      fileContentQuery.data,
      initVariables,
      template.Variables
    ),
    additionalSettings:
      template.EdgeSettings || getDefaultEdgeTemplateSettings(),
    envVars: [],
  };

  if (fileContentQuery.error) {
    return <TemplateLoadError template={template} />;
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validation}
      validateOnMount
    >
      <InnerForm
        gitConfig={gitConfig}
        isLoading={mutation.isLoading}
        templateFile={fileContentQuery.data}
        variables={template.Variables}
        onHide={unselect}
        templateType={template.Type}
      />
    </Formik>
  );

  function handleSubmit(values: FormValues) {
    return mutation.mutate(
      getPayload(
        gitConfig,
        template.Type === StackType.Kubernetes
          ? DeploymentType.Kubernetes
          : DeploymentType.Compose,
        values
      ),
      {
        onSuccess() {
          notifySuccess('Success', 'Edge Stack created');
          router.stateService.go('edge.stacks');
        },
      }
    );
  }
}

function getPayload(
  gitConfig: GitFormModel | undefined,
  deploymentType: DeploymentType,
  values: FormValues
): CreateEdgeStackPayload {
  const basePayload = {
    name: values.name,
    deploymentType,
    edgeGroups: values.edgeGroupIds,
    envVars: values.envVars,
    prePullImage: values.additionalSettings.PrePullImage,
    registries: values.additionalSettings.PrivateRegistryId
      ? [values.additionalSettings.PrivateRegistryId]
      : [],
    retryDeploy: values.additionalSettings.RetryDeploy,
  };
  if (gitConfig) {
    return {
      method: 'git',
      payload: {
        ...basePayload,
        relativePathSettings: values.additionalSettings.RelativePathSettings,
        git: gitConfig,
      },
    };
  }

  return {
    method: 'string',
    payload: {
      ...basePayload,
      fileContent: values.fileContent,
    },
  };
}
