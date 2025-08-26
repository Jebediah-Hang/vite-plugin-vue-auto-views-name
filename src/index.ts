import type { Plugin } from "vite";
import { parse, compileScript } from "@vue/compiler-sfc";

interface OptionsType {
  match?: string | RegExp;
  removePath?: string;
  rewrite?: (id: string) => string;
}

// 默认name处理方法，取 /src/views 下的路径
function createName(filePath: string, removePath: string): string {
  const viewsIndex = filePath.indexOf(removePath);
  if (viewsIndex === -1) {
    return "";
  }

  const pathName = filePath.substring(viewsIndex - 1 + removePath.length).replace(/\.vue$/, "");

  return pathName;
}

export default function autoViewsName(options?: OptionsType): Plugin {
  return {
    name: "vite-plugin-vue-auto-views-name",
    enforce: "pre",
    transform(code: string, id: string) {
      const {
        match = /\/src\/views\/.*\.vue$/i,
        removePath = "/src/views/",
        rewrite
      } = options || {};

      if (!RegExp(match).test(id)) {
        return;
      }

      try {
        const name = typeof rewrite === "function" ? rewrite(id) : createName(id, removePath);

        if (!name) {
          return;
        }

        const { descriptor } = parse(code);

        if (!descriptor.script && !descriptor.scriptSetup) {
          // 没有 script 标签的直接添加 script setup 和 defineOptions
          return {
            code: `${code}\n<script setup>\ndefineOptions({ name: '${name}' })\n</script>`
          };
        }

        const astResult = compileScript(descriptor, { id });

        if (!descriptor.script && descriptor.scriptSetup) {
          const scriptSetupAst = astResult.scriptSetupAst;

          const defineOptionsStatement: any = scriptSetupAst
            ? scriptSetupAst.find((s: any) => s.expression?.callee?.name === "defineOptions")
            : null;

          const defineOptionsArgs: Array<any> | null = defineOptionsStatement
            ? defineOptionsStatement.expression?.arguments[0]?.properties
            : null;

          const defineOptionsNameProp: any = defineOptionsArgs
            ? defineOptionsArgs.find((arg) => arg.key.name === "name")
            : null;

          const scriptAttrs = Object.entries(descriptor.scriptSetup.attrs)
            .map(([attr, value]) => `${attr}${typeof value === "string" ? `="${value}"` : ""}`)
            .join(" ");

          const scriptContent = descriptor.scriptSetup.content;
          let newScriptContent = "";

          if (defineOptionsNameProp) {
            // defineOptions 已有 name，不再处理
            return;
          } else if (defineOptionsArgs) {
            // defineOptions 有参数但没 name，添加 name
            newScriptContent = scriptContent.replace(
              /defineOptions\s*\(\s*\{([\s\S]*?)\}\s*\)/g,
              `defineOptions({ name: '${name}', $1 })`
            );
          } else if (defineOptionsStatement) {
            // defineOptions 没有参数，添加 { name }
            newScriptContent = scriptContent.replace(
              /defineOptions\s*\(\s*\)/g,
              `defineOptions({ name: '${name}' })`
            );
          } else {
            // 没有 defineOptions，添加 defineOptions({ name })
            newScriptContent = `${scriptContent}\ndefineOptions({ name: '${name}' })\n`;
          }

          // 替换原 script 内容
          const newCode = code.replace(
            /<script([^>]*)setup([^>]*)>([\s\S]*?)<\/script>/i,
            `<script ${scriptAttrs}>${newScriptContent}</script>`
          );

          return { code: newCode };
        }

        return;
      } catch (error) {
        console.warn(`An error occurred while processing [${id}].`, error);
        return;
      }
    }
  };
}
