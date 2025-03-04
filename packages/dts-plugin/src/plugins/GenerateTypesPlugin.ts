import fs from 'fs';
import path from 'path';
import { isDev, getCompilerOutputDir } from './utils';
import {
  logger,
  normalizeOptions,
  type moduleFederationPlugin,
} from '@module-federation/sdk';
import {
  validateOptions,
  generateTypes,
  generateTypesInChildProcess,
  retrieveTypesAssetsInfo,
  type DTSManagerOptions,
} from '../core/index';

import type { Compilation, Compiler, WebpackPluginInstance } from 'webpack';

export class GenerateTypesPlugin implements WebpackPluginInstance {
  pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  dtsOptions: moduleFederationPlugin.PluginDtsOptions;
  defaultOptions: moduleFederationPlugin.DtsRemoteOptions;
  fetchRemoteTypeUrlsPromise: Promise<
    moduleFederationPlugin.DtsHostOptions['remoteTypeUrls'] | undefined
  >;
  callback: () => void;

  constructor(
    pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions,
    dtsOptions: moduleFederationPlugin.PluginDtsOptions,
    defaultOptions: moduleFederationPlugin.DtsRemoteOptions,
    fetchRemoteTypeUrlsPromise: Promise<
      moduleFederationPlugin.DtsHostOptions['remoteTypeUrls'] | undefined
    >,
    callback: () => void,
  ) {
    this.pluginOptions = pluginOptions;
    this.dtsOptions = dtsOptions;
    this.defaultOptions = defaultOptions;
    this.fetchRemoteTypeUrlsPromise = fetchRemoteTypeUrlsPromise;
    this.callback = callback;
  }

  apply(compiler: Compiler) {
    const {
      dtsOptions,
      defaultOptions,
      pluginOptions,
      fetchRemoteTypeUrlsPromise,
      callback,
    } = this;

    const normalizedGenerateTypes =
      normalizeOptions<moduleFederationPlugin.DtsRemoteOptions>(
        true,
        defaultOptions,
        'mfOptions.dts.generateTypes',
      )(dtsOptions.generateTypes);

    if (!normalizedGenerateTypes) {
      callback();
      return;
    }

    const normalizedConsumeTypes =
      normalizeOptions<moduleFederationPlugin.DtsHostOptions>(
        true,
        defaultOptions,
        'mfOptions.dts.consumeTypes',
      )(dtsOptions.consumeTypes);

    const finalOptions: DTSManagerOptions = {
      remote: {
        implementation: dtsOptions.implementation,
        context: compiler.context,
        outputDir: getCompilerOutputDir(compiler),
        moduleFederationConfig: pluginOptions,
        ...normalizedGenerateTypes,
      },
      host:
        normalizedConsumeTypes === false
          ? undefined
          : {
              context: compiler.context,
              moduleFederationConfig: pluginOptions,
              ...normalizedGenerateTypes,
            },
      extraOptions: dtsOptions.extraOptions || {},
      displayErrorInTerminal: dtsOptions.displayErrorInTerminal,
    };

    if (dtsOptions.tsConfigPath && !finalOptions.remote.tsConfigPath) {
      finalOptions.remote.tsConfigPath = dtsOptions.tsConfigPath;
    }

    validateOptions(finalOptions.remote);
    const isProd = !isDev();
    const getGenerateTypesFn = () => {
      let fn: typeof generateTypes | typeof generateTypesInChildProcess =
        generateTypes;
      let res: ReturnType<typeof generateTypes>;
      if (finalOptions.remote.compileInChildProcess) {
        fn = generateTypesInChildProcess;
      }
      if (isProd) {
        res = fn(finalOptions);
        return () => res;
      }
      return fn;
    };
    const generateTypesFn = getGenerateTypesFn();

    const emitTypesFiles = async (compilation: Compilation) => {
      // Dev types will be generated by DevPlugin, the archive filename usually is dist/.dev-server.zip
      try {
        const { zipTypesPath, apiTypesPath, zipName, apiFileName } =
          retrieveTypesAssetsInfo(finalOptions.remote);

        if (isProd && zipName && compilation.getAsset(zipName)) {
          callback();
          return;
        }

        logger.debug('start generating types...');
        await generateTypesFn(finalOptions);
        logger.debug('generate types success!');
        const config = finalOptions.remote.moduleFederationConfig;
        let zipPrefix = '';
        if (typeof config.manifest === 'object' && config.manifest.filePath) {
          zipPrefix = config.manifest.filePath;
        } else if (
          typeof config.manifest === 'object' &&
          config.manifest.fileName
        ) {
          zipPrefix = path.dirname(config.manifest.fileName);
        } else if (config.filename) {
          zipPrefix = path.dirname(config.filename);
        }

        if (isProd) {
          const zipAssetName = path.join(zipPrefix, zipName);
          const apiAssetName = path.join(zipPrefix, apiFileName);
          if (zipTypesPath && !compilation.getAsset(zipAssetName)) {
            compilation.emitAsset(
              zipAssetName,
              new compiler.webpack.sources.RawSource(
                fs.readFileSync(zipTypesPath),
                false,
              ),
            );
          }

          if (apiTypesPath && !compilation.getAsset(apiAssetName)) {
            compilation.emitAsset(
              apiAssetName,
              new compiler.webpack.sources.RawSource(
                fs.readFileSync(apiTypesPath),
                false,
              ),
            );
          }
          callback();
        } else {
          const isEEXIST = (err: NodeJS.ErrnoException) => {
            return err.code == 'EEXIST';
          };
          if (zipTypesPath) {
            const zipContent = fs.readFileSync(zipTypesPath);
            const zipOutputPath = path.join(
              compiler.outputPath,
              zipPrefix,
              zipName,
            );
            await new Promise<void>((resolve, reject) => {
              compiler.outputFileSystem.mkdir(
                path.dirname(zipOutputPath),
                (err) => {
                  if (err && !isEEXIST(err)) {
                    reject(err);
                  } else {
                    compiler.outputFileSystem.writeFile(
                      zipOutputPath,
                      zipContent,
                      (writeErr) => {
                        if (writeErr && !isEEXIST(writeErr)) {
                          reject(writeErr);
                        } else {
                          resolve();
                        }
                      },
                    );
                  }
                },
              );
            });
          }

          if (apiTypesPath) {
            const apiContent = fs.readFileSync(apiTypesPath);
            const apiOutputPath = path.join(
              compiler.outputPath,
              zipPrefix,
              apiFileName,
            );
            await new Promise<void>((resolve, reject) => {
              compiler.outputFileSystem.mkdir(
                path.dirname(apiOutputPath),
                (err) => {
                  if (err && !isEEXIST(err)) {
                    reject(err);
                  } else {
                    compiler.outputFileSystem.writeFile(
                      apiOutputPath,
                      apiContent,
                      (writeErr) => {
                        if (writeErr && !isEEXIST(writeErr)) {
                          reject(writeErr);
                        } else {
                          resolve();
                        }
                      },
                    );
                  }
                },
              );
            });
          }

          callback();
        }
      } catch (err) {
        callback();
        if (finalOptions.displayErrorInTerminal) {
          console.error('Error in mf:generateTypes processAssets hook:', err);
        }
        logger.debug('generate types fail!');
      }
    };

    compiler.hooks.thisCompilation.tap('mf:generateTypes', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'mf:generateTypes',
          stage:
            // @ts-expect-error use runtime variable in case peer dep not installed
            compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
        },
        async () => {
          await fetchRemoteTypeUrlsPromise;
          const emitTypesFilesPromise = emitTypesFiles(compilation);
          if (isProd) {
            await emitTypesFilesPromise;
          }
        },
      );
    });
  }
}
