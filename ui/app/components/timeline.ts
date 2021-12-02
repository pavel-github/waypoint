import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import ApiService from 'waypoint/services/api';
import { Build, Deployment, Release } from 'waypoint-pb';

interface Artifact {
  sequence: number;
  type: string;
  route: string;
  completeTime: number;
  isCurrentRoute: boolean;
}

interface TimelineArgs {
  currentArtifact: Deployment.AsObject | Build.AsObject | Release.AsObject;
}

let TYPE_TRANSLATIONS = {
  build: 'page.artifact.timeline.build',
  deployment: 'page.artifact.timeline.deployment',
  release: 'page.artifact.timeline.release',
};

let TYPE_ROUTES = {
  build: 'workspace.projects.project.app.build',
  deployment: 'workspace.projects.project.app.deployment',
  release: 'workspace.projects.project.app.release',
}

export default class Timeline extends Component<TimelineArgs> {
  @service api!: ApiService;
  @service router!: RouterService;

  get artifacts(): Artifact[] {
    let timelineObjects = [] as Artifact[];
    let preload = this.args.currentArtifact.preload;
    let build = preload?.build ?? null;
    let deployment = preload?.deployment ?? null;
    if (build) {
      let buildObj = {
        sequence: build.sequence,
        type: TYPE_TRANSLATIONS.build,
        route: TYPE_ROUTES.build,
        completeTime: build.status.completeTime.seconds,
        isCurrentRoute: false,
      } as Artifact;
      timelineObjects.push(buildObj);
    } else {
      // if there's no build in preload, we're looking at a build
      let buildObj = {
        sequence: this.args.currentArtifact.sequence,
        type: TYPE_TRANSLATIONS.build,
        route: TYPE_ROUTES.build,
        completeTime: this.args.currentArtifact.status?.completeTime?.seconds,
        isCurrentRoute: true,
      } as Artifact;
      timelineObjects.push(buildObj);
      return timelineObjects;
    }

    if (deployment) {
      let deploymentObj = {
        sequence: deployment.sequence,
        type: TYPE_TRANSLATIONS.deployment,
        route: TYPE_ROUTES.deployment,
        completeTime: deployment.status.completeTime.seconds,
        isCurrentRoute: false,
      } as Artifact;
      timelineObjects.push(deploymentObj);

      // if there's a deployment in the preload, we're looking at a release
      let releaseObj = {
        sequence: this.args.currentArtifact.sequence,
        type: TYPE_TRANSLATIONS.release,
        route: TYPE_ROUTES.release,
        completeTime: this.args.currentArtifact.status?.completeTime?.seconds,
        isCurrentRoute: true,
      } as Artifact;
      timelineObjects.push(releaseObj);
    } else {
      // if there was a build in the preload but not a deployment, we're looking at a deployment
      let deploymentObj = {
        sequence: this.args.currentArtifact.sequence,
        type: TYPE_TRANSLATIONS.deployment,
        route: TYPE_ROUTES.deployment,
        completeTime: this.args.currentArtifact.status?.completeTime?.seconds,
        isCurrentRoute: true,
      } as Artifact;
      timelineObjects.push(deploymentObj);
    }
    return timelineObjects;
  }
}
