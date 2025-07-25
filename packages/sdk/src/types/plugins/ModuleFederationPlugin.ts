import type webpack from 'webpack';
import { Stats } from '../stats';
import { Manifest } from '../manifest';
/**
 * Modules that should be exposed by this container. When provided, property name is used as public name, otherwise public name is automatically inferred from request.
 */
export type Exposes = (ExposesItem | ExposesObject)[] | ExposesObject;
/**
 * Module that should be exposed by this container.
 */
export type ExposesItem = string;
/**
 * Modules that should be exposed by this container.
 */
export type ExposesItems = ExposesItem[];
/**
 * Add a container for define/require functions in the AMD module.
 */
export type AmdContainer = string;
/**
 * Add a comment in the UMD wrapper.
 */
export type AuxiliaryComment = string | LibraryCustomUmdCommentObject;
/**
 * Specify which export should be exposed as library.
 */
export type LibraryExport = string[] | string;
/**
 * The name of the library (some types allow unnamed libraries too).
 */
export type LibraryName = string[] | string | LibraryCustomUmdObject;
/**
 * Type of library (types included by default are 'var', 'module', 'assign', 'assign-properties', 'this', 'window', 'self', 'global', 'commonjs', 'commonjs2', 'commonjs-module', 'commonjs-static', 'amd', 'amd-require', 'umd', 'umd2', 'jsonp', 'system', but others might be added by plugins).
 */
export type LibraryType =
  | (
      | 'var'
      | 'module'
      | 'assign'
      | 'assign-properties'
      | 'this'
      | 'window'
      | 'self'
      | 'global'
      | 'commonjs'
      | 'commonjs2'
      | 'commonjs-module'
      | 'commonjs-static'
      | 'amd'
      | 'amd-require'
      | 'umd'
      | 'umd2'
      | 'jsonp'
      | 'system'
    )
  | string;
/**
 * If `output.libraryTarget` is set to umd and `output.library` is set, setting this to true will name the AMD module.
 */
export type UmdNamedDefine = boolean;
/**
 * Specifies the default type of externals ('amd*', 'umd*', 'system' and 'jsonp' depend on output.libraryTarget set to the same value).
 */
export type ExternalsType =
  | 'var'
  | 'module'
  | 'assign'
  | 'this'
  | 'window'
  | 'self'
  | 'global'
  | 'commonjs'
  | 'commonjs2'
  | 'commonjs-module'
  | 'commonjs-static'
  | 'amd'
  | 'amd-require'
  | 'umd'
  | 'umd2'
  | 'jsonp'
  | 'system'
  | 'promise'
  | 'import'
  | 'script'
  | 'module-import'
  | 'node-commonjs';
/**
 * Container locations and request scopes from which modules should be resolved and loaded at runtime. When provided, property name is used as request scope, otherwise request scope is automatically inferred from container location.
 */
export type Remotes = (RemotesItem | RemotesObject)[] | RemotesObject;
/**
 * Container location from which modules should be resolved and loaded at runtime.
 */
export type RemotesItem = string;
/**
 * Container locations from which modules should be resolved and loaded at runtime.
 */
export type RemotesItems = RemotesItem[];
/**
 * The name of the runtime chunk. If set a runtime chunk with this name is created or an existing entrypoint is used as runtime.
 */
export type EntryRuntime = false | string;
/**
 * Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.
 */
export type Shared = (SharedItem | SharedObject)[] | SharedObject;
/**
 * A module that should be shared in the share scope.
 */
export type SharedItem = string;
/**
 * Enable Data Prefetch
 */
export type DataPrefetch = boolean;

export interface AdditionalDataOptions {
  stats: Stats;
  manifest?: Manifest;
  pluginOptions: ModuleFederationPluginOptions;
  compiler: webpack.Compiler;
  compilation: webpack.Compilation;
  bundler: 'webpack' | 'rspack';
}
export interface PluginManifestOptions {
  filePath?: string;
  disableAssetsAnalyze?: boolean;
  fileName?: string;
  additionalData?: (
    options: AdditionalDataOptions,
  ) => Promise<Stats | void> | Stats | void;
}

export interface PluginDevOptions {
  disableLiveReload?: boolean;
  disableHotTypesReload?: boolean;
  disableDynamicRemoteTypeHints?: boolean;
}

interface RemoteTypeUrl {
  alias?: string;
  api: string;
  zip: string;
}

export interface RemoteTypeUrls {
  [remoteName: string]: RemoteTypeUrl;
}

export interface DtsHostOptions {
  typesFolder?: string;
  abortOnError?: boolean;
  remoteTypesFolder?: string;
  deleteTypesFolder?: boolean;
  maxRetries?: number;
  consumeAPITypes?: boolean;
  runtimePkgs?: string[];
  remoteTypeUrls?: (() => Promise<RemoteTypeUrls>) | RemoteTypeUrls;
  timeout?: number;
  typesOnBuild?: boolean;
}

export interface DtsRemoteOptions {
  tsConfigPath?: string;
  typesFolder?: string;
  compiledTypesFolder?: string;
  deleteTypesFolder?: boolean;
  additionalFilesToCompile?: string[];
  compileInChildProcess?: boolean;
  compilerInstance?: 'tsc' | 'vue-tsc' | 'tspc' | string;
  generateAPITypes?: boolean;
  extractThirdParty?:
    | boolean
    | {
        exclude?: Array<string | RegExp>;
      };
  extractRemoteTypes?: boolean;
  abortOnError?: boolean;
}

export interface PluginDtsOptions {
  generateTypes?: boolean | DtsRemoteOptions;
  consumeTypes?: boolean | DtsHostOptions;
  tsConfigPath?: string;
  extraOptions?: Record<string, any>;
  implementation?: string;
  cwd?: string;
  displayErrorInTerminal?: boolean;
}

export type AsyncBoundaryOptions = {
  eager?: RegExp | ((module: any) => boolean);
  excludeChunk?: (chunk: any) => boolean;
};

export interface ModuleFederationPluginOptions {
  /**
   * Modules that should be exposed by this container. When provided, property name is used as public name, otherwise public name is automatically inferred from request.
   */
  exposes?: Exposes;
  /**
   * The filename of the container as relative path inside the `output.path` directory.
   */
  filename?: string;
  /**
   * Options for library.
   */
  library?: LibraryOptions;
  /**
   * The name of the container.
   */
  name?: string;
  /**
   * The external type of the remote containers.
   */
  remoteType?: ExternalsType;
  /**
   * Container locations and request scopes from which modules should be resolved and loaded at runtime. When provided, property name is used as request scope, otherwise request scope is automatically inferred from container location.
   */
  remotes?: Remotes;
  /**
   * The name of the runtime chunk. If set a runtime chunk with this name is created or an existing entrypoint is used as runtime.
   */
  runtime?: EntryRuntime;
  /**
   * Share scope name used for all shared modules (defaults to 'default').
   */
  shareScope?: string | string[];
  /**
   * load shared strategy(defaults to 'version-first').
   */
  shareStrategy?: SharedStrategy;
  /**
   * Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.
   */
  shared?: Shared;
  /**
   * Runtime plugin file paths or package name.
   */
  runtimePlugins?: string[];
  /**
   * Custom public path function
   */
  getPublicPath?: string;
  /**
   * Bundler runtime path
   */
  implementation?: string;

  manifest?: boolean | PluginManifestOptions;
  dev?: boolean | PluginDevOptions;
  dts?: boolean | PluginDtsOptions;
  dataPrefetch?: DataPrefetch;
  virtualRuntimeEntry?: boolean;
  experiments?: {
    externalRuntime?: boolean;
    provideExternalRuntime?: boolean;
    asyncStartup?: boolean;
    /**
     * Options related to build optimizations.
     */
    optimization?: {
      /**
       * Enable optimization to skip snapshot plugin
       */
      disableSnapshot?: boolean;
      /**
       * Target environment for the build
       */
      target?: 'web' | 'node';
    };
  };
  bridge?: {
    /**
     * Disables the default alias setting in the bridge.
     * When true, users must manually handle basename through root component props.
     * @default false
     */
    disableAlias?: boolean;
  };
  /**
   * Configuration for async boundary plugin
   */
  async?: boolean | AsyncBoundaryOptions;
}
/**
 * Modules that should be exposed by this container. Property names are used as public paths.
 */
export interface ExposesObject {
  /**
   * Modules that should be exposed by this container.
   */
  [k: string]: ExposesConfig | ExposesItem | ExposesItems;
}
/**
 * Advanced configuration for modules that should be exposed by this container.
 */
export interface ExposesConfig {
  /**
   * Request to a module that should be exposed by this container.
   */
  import: ExposesItem | ExposesItems;
  /**
   * Custom chunk name for the exposed module.
   */
  name?: string;
}
/**
 * Options for library.
 */
export interface LibraryOptions {
  /**
   * Add a container for define/require functions in the AMD module.
   */
  amdContainer?: AmdContainer;
  /**
   * Add a comment in the UMD wrapper.
   */
  auxiliaryComment?: AuxiliaryComment;
  /**
   * Specify which export should be exposed as library.
   */
  export?: LibraryExport;
  /**
   * The name of the library (some types allow unnamed libraries too).
   */
  name?: LibraryName;
  /**
   * Type of library (types included by default are 'var', 'module', 'assign', 'assign-properties', 'this', 'window', 'self', 'global', 'commonjs', 'commonjs2', 'commonjs-module', 'commonjs-static', 'amd', 'amd-require', 'umd', 'umd2', 'jsonp', 'system', but others might be added by plugins).
   */
  type: LibraryType;
  /**
   * If `output.libraryTarget` is set to umd and `output.library` is set, setting this to true will name the AMD module.
   */
  umdNamedDefine?: UmdNamedDefine;
}
/**
 * Set explicit comments for `commonjs`, `commonjs2`, `amd`, and `root`.
 */
export interface LibraryCustomUmdCommentObject {
  /**
   * Set comment for `amd` section in UMD.
   */
  amd?: string;
  /**
   * Set comment for `commonjs` (exports) section in UMD.
   */
  commonjs?: string;
  /**
   * Set comment for `commonjs2` (module.exports) section in UMD.
   */
  commonjs2?: string;
  /**
   * Set comment for `root` (global variable) section in UMD.
   */
  root?: string;
}
/**
 * Description object for all UMD variants of the library name.
 */
export interface LibraryCustomUmdObject {
  /**
   * Name of the exposed AMD library in the UMD.
   */
  amd?: string;
  /**
   * Name of the exposed commonjs export in the UMD.
   */
  commonjs?: string;
  /**
   * Name of the property exposed globally by a UMD library.
   */
  root?: string[] | string;
}
/**
 * Container locations from which modules should be resolved and loaded at runtime. Property names are used as request scopes.
 */
export interface RemotesObject {
  /**
   * Container locations from which modules should be resolved and loaded at runtime.
   */
  [k: string]: RemotesConfig | RemotesItem | RemotesItems;
}
/**
 * Advanced configuration for container locations from which modules should be resolved and loaded at runtime.
 */
export interface RemotesConfig {
  /**
   * Container locations from which modules should be resolved and loaded at runtime.
   */
  external: RemotesItem | RemotesItems;
  /**
   * The name of the share scope shared with this remote.
   */
  shareScope?: string | string[];
}
/**
 * Modules that should be shared in the share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.
 */
export interface SharedObject {
  /**
   * Modules that should be shared in the share scope.
   */
  [k: string]: SharedConfig | SharedItem;
}

export type SharedStrategy = 'version-first' | 'loaded-first';
/**
 * Advanced configuration for modules that should be shared in the share scope.
 */
export interface SharedConfig {
  /**
   * Include the provided and fallback module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.
   */
  eager?: boolean;
  /**
   * Provided module that should be provided to share scope. Also acts as fallback module if no shared module is found in share scope or version isn't valid. Defaults to the property name.
   */
  import?: false | SharedItem;
  /**
   * Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.
   */
  packageName?: string;
  /**
   * Version requirement from module in share scope.
   */
  requiredVersion?: false | string;
  /**
   * Module is looked up under this key from the share scope.
   */
  shareKey?: string;
  /**
   * Share scope name.
   */
  shareScope?: string | string[];
  /**
   * load shared strategy(defaults to 'version-first').
   */
  shareStrategy?: SharedStrategy;
  /**
   * Allow only a single version of the shared module in share scope (disabled by default).
   */
  singleton?: boolean;
  /**
   * Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).
   */
  strictVersion?: boolean;
  /**
   * Version of the provided module. Will replace lower matching versions, but not higher.
   */
  version?: false | string;
}
