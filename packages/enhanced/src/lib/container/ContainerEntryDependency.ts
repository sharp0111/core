/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

import Dependency from 'webpack/lib/Dependency';
import { ExposeOptions } from './ContainerEntryModule';
import makeSerializable from 'webpack/lib/util/makeSerializable';

/** @typedef {import("./ContainerEntryModule").ExposeOptions} ExposeOptions */

class ContainerEntryDependency extends Dependency {
  public name: string;
  public exposes: [string, ExposeOptions][];
  public shareScope: string;

  /**
   * @param {string} name entry name
   * @param {[string, ExposeOptions][]} exposes list of exposed modules
   * @param {string} shareScope name of the share scope
   */
  constructor(
    name: string,
    exposes: [string, ExposeOptions][],
    shareScope: string,
  ) {
    super();
    this.name = name;
    this.exposes = exposes;
    this.shareScope = shareScope;
  }

  /**
   * @returns {string | null} an identifier to merge equal requests
   */
  override getResourceIdentifier(): string | null {
    return `container-entry-${this.name}`;
  }

  override get type(): string {
    return 'container entry';
  }

  override get category(): string {
    return 'esm';
  }
}

makeSerializable(
  ContainerEntryDependency,
  'webpack/lib/container/ContainerEntryDependency',
);

export default ContainerEntryDependency;
