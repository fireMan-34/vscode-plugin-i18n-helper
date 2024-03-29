import type { ExtensionContext } from "vscode";
import { env, window } from "vscode";

import { CMD_KEY } from "constants/index";
import { I18nDbPaser, I18nGenTemplate } from "models/index";
import {
  GeneratedCodeFromStrMode,
  type ICommondItem,
} from "types/index";
import { getGlobalConfiguration } from "utils/conf";
import { getWrokspaceFloder } from "utils/path.code";

/** 文本转国际化代码 */
const strToi18nCode = async (
  context: ExtensionContext,
  str: string,
  mode?: GeneratedCodeFromStrMode
) => {
  if (!str) {
    return;
  }
  const globalConfig = await getGlobalConfiguration();
  const { generatedCodeFromStrMode, mainLanguage } = globalConfig;
  const commandMode = mode ?? generatedCodeFromStrMode;
  const workfloder = await getWrokspaceFloder({ multiplySelect: "default" });
  const i18nDbParser = new I18nDbPaser(globalConfig, workfloder);
  await i18nDbParser.prepareCheck();
  if (commandMode === GeneratedCodeFromStrMode.none) {
    return;
  }
  const i18nKeyAndValMap = await i18nDbParser.findKeyOrValue(str);
  const item = i18nKeyAndValMap[mainLanguage];
  if (!item) {
    return;
  }
  if (commandMode === GeneratedCodeFromStrMode.ask) {
    const result = await window.showQuickPick(["是", "否"], {
      title: "检测到可识别的国际化字符串，是否需要帮你转换到剪切板中",
    });
    if (result === "否" || !result) {
      return;
    }
  }
  const [id, msg] = item;
  const i18nGenTemplate = new I18nGenTemplate().refreshTemplateModals();
  const newCode = await i18nGenTemplate.renderI18nCode({ id, msg });
  if (!newCode) {
    return;
  }
  env.clipboard.writeText(newCode);
  window.showInformationMessage(
    "检测到可识别的国际化字符串，已为你转换成动态模板对应的代码"
  );
};

/** 打开界面视图指令 */
const item: ICommondItem = {
  cmd: CMD_KEY.STR_TO_I18N_CODE,
  cmdExcuter: strToi18nCode,
};
export default item;
