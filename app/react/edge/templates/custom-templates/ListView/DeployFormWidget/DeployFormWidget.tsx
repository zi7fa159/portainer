import { Rocket } from 'lucide-react';

import { CustomTemplate } from '@/react/portainer/templates/custom-templates/types';

import { Icon } from '@@/Icon';
import { FallbackImage } from '@@/FallbackImage';
import { Widget } from '@@/Widget';

import { DeployForm } from './DeployForm';

export function DeployFormWidget({
  template,
  unselect,
}: {
  template?: CustomTemplate;
  unselect: () => void;
}) {
  if (!template) {
    return null;
  }

  return (
    <div className="row">
      <div className="col-sm-12">
        <Widget>
          <Widget.Title
            icon={
              <FallbackImage
                src={template.Logo}
                fallbackIcon={<Icon icon={Rocket} />}
              />
            }
            title={template.Title}
          />
          <Widget.Body>
            <DeployForm template={template} unselect={unselect} />
          </Widget.Body>
        </Widget>
      </div>
    </div>
  );
}
