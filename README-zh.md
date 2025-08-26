# vite-plugin-vue-auto-views-name

可以自定义Vue组件名的Vite插件

[English](README.md) | 中文

## 功能

* 自动为SFC生成组件名 `name` ，供 `keep-alive` 组件或 `DevTools` 工具等使用
* 默认只处理 `/src/views/` 下的文件，截取相对路径生成组件名，例如文件 `/src/views/pageA/index.vue` 生成的组件名为 `/pageA/index`
* 支持自定义文件匹配规则
* 支持自定义生成组件名方法

## 要求

* vite >= 5.0.0
* vue >= 3.4.0

## 使用

1. 安装 `vite-plugin-vue-auto-views-name`

```bash
npm install -D vite-plugin-vue-auto-views-name
```

2. 在 `vite.config.ts` 中使用

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import autoViewsName from "vite-plugin-vue-auto-views-name";

export default defineConfig({
  plugins: [
    autoViewsName(),
    vue()
  ],
  /* ... */
});
```

## 配置

类型声明

```typescript
interface OptionsType {
  match?: string | RegExp;
  folderPath?: string;
  rewrite?: (id: string) => string;
}
function viewsAutoName(options?: OptionsType): Plugin;
```

| 名称       | 默认值                        | 说明                                                                                |
| :--------- | :---------------------------- | :---------------------------------------------------------------------------------- |
| match      | /\\/src\\/views\\/.*\\.vue$/i | 需要处理文件的匹配规则                                                              |
| folderPath | /src/views/                   | 需要删除的路径前缀，自定义rewrite方法后不会生效                                     |
| rewrite    | --                            | 自定义生成组件名方法，参数为文件的绝对路径，返回组件名，返回空则使用Vue的默认组件名 |

