# VibeCraft / 灵感工坊 PRD

状态：Draft v0.3  
日期：2026-06-04  
原始版本：Draft v0.1, 2026-06-02, extracted from `vibecraft-prd.pdf`  
产品定位：面向非技术语言 vibe coding 人群的 Happy Build 可视化学习引擎  
关键词：方块沙盒 / 知识合成 / Agent 注册 / 创作收音机 / 进化大脑 / 灵感村  
Slogan：Build for Fun · Create for Happy · Grow Your Vibe Brain  

一句话：

> 一边用 AI 造东西，一边让知识以可爱、奇怪、可探索的方式进入脑袋。

中文表达：

> 用 AI 造东西，把自己也升级。让每一次 AI 创作，都变成一次快乐长脑子的冒险。

## 1. 产品摘要

VibeCraft / 灵感工坊 是一个把 AI 创作过程变成“方块沙盒世界”的学习、身份与协作产品。

它不是传统编程课，也不是项目管理工具，也不是普通作品集。它面向正在用 Codex、Claude Code、Cursor、Replit、Lovable 等工具进行 vibe coding 的非技术或轻技术创作者，把每次 build 过程中的成果、问题、知识点、证据、情绪反馈、下一步行动，转化成可以捡、可以挖、可以合成、可以播报、可以展示、可以授权给 Agent 使用的“知识方块”和“创作身份”。

核心体验：

- 用户用 AI 做项目。
- Agent 完成工作并返回 proof / receipt。
- 系统自动掉落 Today Drop、Vibe Sticker、知识方块和成长包。
- 用户遇到不懂的地方，可以像挖矿一样主动探索。
- 系统用普通人能懂的话解释概念，并把它合成为用户自己的理解。
- 任务进度在可玩世界里变成 Goal Tree、掉落物、XP、Daybook 记录和 Vibe Radio 播报。
- 长期积累形成用户的 Vibe Brain / 进化大脑。
- 用户通过 `username.vibecraft.bio` 展示自己的 AI 时代名片，并在灵感村找到互补伙伴一起 Happy Build。

核心感觉：

> Knowledge enters my head in a cute, strange, and understandable form.

## 2. 背景与灵感来源

### 2.1 用户灵感

本产品方向来自几个明确的交互灵感：

- 星露谷日记：每天有生活感、有积累、有小收获，用户愿意回来。
- AI 电台 Claudio：把长期歌单蒸馏成可陪伴的 AI 电台，说明“个人积累可以变成一种人格化媒介”。
- 邪门单词记忆：知识以可爱、奇怪、容易记住的形式进入脑袋。
- 电影中人类与外星人破译语言的桥段：学习不是先讲术语，而是先建立共同语言。
- 拍照学单词：用户不是坐下上课，而是在生活/创作场景里自然触发学习。
- Minecraft 式方块沙盒：主动探索、挖矿、合成、建造、技能树、村庄协作，比“课程目录”更适合快乐学习。
- Gather/Town 式协作空间：用户和协作者可以以人物化方式出现在共同空间里，但场景不是办公室，而是方块沙盒世界。

### 2.2 核心判断

AI 工具正在让“做出东西”的门槛快速降低，但新的问题出现了：

- 非技术用户可以让 AI 写代码，但不一定理解发生了什么。
- 项目越做越复杂，聊天记录越来越长，用户很难复盘。
- 用户不想被迫学一套严肃术语，但希望自己真的在进步。
- 现有 AI 编程工具关注“生成”，很少关注“用户如何理解、记住、成长、展示和协作”。
- Agent 做完工作后，用户需要一个可验证、可理解、可继续的状态上传与同步机制。

VibeCraft 要解决的是生成之后的问题：

> AI 帮我造出来了，但我怎么把这个过程变成自己的知识、能力、身份和可携带大脑？

## 3. 目标用户

### 3.1 核心用户

非技术语言 vibe coding 创作者。

他们通常具备：

- 有想法、有表达欲、有产品感或内容感。
- 不一定会写代码，但愿意用 AI 把想法做成 demo、网页、工具、游戏、自动化流程。
- 会使用 ChatGPT、Claude、Codex、Cursor、Replit、Lovable 等工具。
- 对“学习编程”有兴趣，但抗拒传统课程、术语轰炸和枯燥教程。
- 希望自己越 build 越强，而不是每次都只靠 AI 碰运气。
- 希望自己的 AI 作品、项目痕迹和成长能成为公开身份。

典型用户画像：

1. 独立创作者：想把内容、产品点子、互动页面快速做出来。
2. 黑客松选手：需要在 24-72 小时内快速理解、构建、展示。
3. AI 产品经理/运营/设计师：能描述需求，但希望更理解技术边界。
4. 教育型创作者：希望把学习内容变成有趣交互。
5. 小团队 founder：希望自己、Agent、协作者之间有可继承的项目记忆。
6. Agent-heavy builder：每天让 Codex/Claude Code/Cursor 做很多事，但需要一个能确认进展、解释术语、生成公开名片的层。

### 3.2 非目标用户

短期内不优先服务：

- 已经高度专业的工程师，他们更需要 IDE 插件、调试器、CI、代码审查流。
- 只想刷题或系统学习 CS 基础的人。
- 只需要普通项目管理看板的人。
- 对 AI 创作没有兴趣的人。
- 期待完整商业游戏体验、多人实时沙盒、复杂战斗/经济系统的玩家。

## 4. 市场机会

### 4.1 市场切入点

VibeCraft 不直接进入“AI 编程工具”红海，而是切入 AI 编程工具之后的空白层：

> AI 创作过程的学习层、记忆层、身份层、社区协作层。

可理解为：

- Cursor / Codex / Claude Code 负责帮用户做。
- DoneGraph / Agent receipt 负责记录什么被完成、有什么证据。
- VibeCraft 负责帮用户懂、记住、积累、展示、协作和授权未来 Agent。

### 4.2 市场假设

VibeCraft 面向三个正在扩大的趋势：

1. AI-native builder 人群增长  
   越来越多非工程师开始用 AI 构建软件、网页、自动化和内容产品。

2. 从“生成工具”转向“成长工具”  
   用户不满足于一次性生成，更希望形成长期能力、个人资产和公开身份。

3. Agent 需要可授权的个人上下文  
   未来用户会把自己的偏好、项目记忆、创作习惯授权给不同 Agent。谁能管理用户的大脑包，谁就更靠近长期入口。

### 4.3 市场规模估算方式

当前 PRD 不伪造精确市场规模数字，MVP 期使用可验证指标代替宏大 TAM。

可按三层估算：

- TAM：全球使用 AI 工具进行创作、写作、编程、自动化的知识工作者与创作者。
- SAM：使用 AI 编程/无代码/低代码工具构建产品 demo 的 creator、founder、PM、designer、学生。
- SOM：中文与英文市场里，愿意尝试“游戏化 AI 学习/项目记忆/公开名片”的早期 vibe coding 人群。

MVP 阶段最关键的不是证明市场大，而是证明：

- 用户愿意把 VibeCraft 放进 build 流程。
- 用户愿意每天回来查看掉落、Daybook、Radio 和技能树。
- 用户愿意把自己的 Vibe Brain 当作资产保存。
- 用户愿意用 `username.vibecraft.bio` 展示自己的 AI 作品与身份。
- 用户愿意因为身份展示与他人发起协作。

### 4.4 Why Now

AI coding 工具已经进入主流，但“确认、理解、回看、交接、身份化”的需求仍未被充分解决。

外部信号：

- Stack Overflow Developer Survey 2025 显示，84% 受访者正在使用或计划使用 AI 工具参与开发流程。
- 同一调查显示，大量开发者对 AI “almost right, but not quite” 的结果感到挫败，说明 AI 工作之后的验证和理解仍是核心痛点。

产品推论：

VibeCraft 不应和 Agent 抢“做事”入口，而应成为 Agent 完成工作之后的可爱可信解释层、成长层和身份层。

## 5. 核心问题

### 5.1 用户问题

用户现在的体验是：

- 我能让 AI 帮我做东西，但做完之后我不一定懂。
- 我不想看长篇技术解释，但我想知道“这到底是什么”。
- 我明天回来，经常忘了昨天做了什么。
- 我不知道自己在 AI 创作里到底擅长什么。
- 我很难向别人展示我是什么类型的 builder。
- 我想找互补伙伴，但别人也不知道我会什么、缺什么。
- 我把任务发给 Agent 之后，Web 端不知道如何可靠地同步结果和解锁成长。

### 5.2 产品要解决的问题

VibeCraft 要把“AI 帮我做了什么”翻译成普通人能理解、愿意探索、能够积累、可以展示、能够授权给未来 Agent 的形式。

核心问题陈述：

> 非技术 AI 创作者在 vibe coding 过程中缺少一个可爱、可理解、可持续积累、可验证同步的学习与身份系统，导致他们虽然能做出东西，却难以真正理解、复盘、成长、展示和协作。

## 6. Aha Moment

用户第一次打开 VibeCraft，看到的不是聊天记录，也不是任务列表，而是一个方块世界：

- 今天做出的功能变成了 Today Drop。
- 不懂的技术概念变成了可以挖的矿。
- AI 做过的关键动作变成了贴纸和证据。
- 用户自己的理解被合成成知识方块。
- 任务进度在世界里变成 Goal Tree，被角色一点点砍掉。
- Vibe Radio 把进展播报成有情绪价值的创作电台。
- 长期积累开始点亮技能树，并进入 Vibe Brain。

用户的 Aha Moment：

> 原来我不是在被 AI 带着跑，我是在用 AI 建造自己的能力世界。

更口语的版本：

> 哇，今天做项目掉出来的这些东西，竟然都变成我的脑子了。

Agent-proof 版本：

> 我的 Agent 做完一件事，网页里的世界真的变了。

## 7. 产品原则

1. 先有趣，再有用  
   用户愿意回来，才有长期学习。

2. 先共同语言，再专业术语  
   技术概念必须先用普通人能懂的话讲清楚，再给专业名称。

3. 每次 build 都要有掉落  
   用户每完成一次 AI 创作，都应该获得可见的成果、知识或成长反馈。

4. Agent-first, Web-light  
   Web 端主要用于看、探索、修改公开信息和同步 proof；解锁、掉落、升级主要来自 Agent 完成工作。

5. 不做负面人格判断  
   所有洞察必须积极、具体、可行动。Vibe Insight 不是人格诊断。

6. 用户拥有自己的大脑  
   Vibe Brain 必须可导出、可删除、可授权、可撤销。

7. 像游戏，但服务真实创作  
   游戏化不是积分皮肤，而是让用户更愿意理解真实项目。

8. Proof before progress  
   公开技能、等级、掉落和成长包必须尽量绑定 Agent receipt / evidence。

## 8. 产品结构

### 8.1 产品命名

主产品名：

- English：VibeCraft
- 中文：灵感工坊

域名：

- `vibecraft.bio`
- 用户公开名片：`username.vibecraft.bio`

模块名：

- Happy Build World：快乐建造世界
- Village Pass：灵感村通行证
- Vibe Sticker：项目贴纸 / 工作小票系统
- Today Drop：今日掉落
- Explore Mine / Knowledge Mine：主动探索矿洞
- Crafting Table：知识合成台
- Vibe Radio / Vibe FM：创作收音机
- Vibe Lens：拍照/截图学习入口
- Daybook：星露谷式每日日志
- Vibe Bio：AI 时代作品名片
- Vibe Brain：进化大脑
- Vibe Village：灵感村
- Skill Tree：技能树
- Growth Pack / Skill Pack：成长包 / 技能包

### 8.2 核心产品循环

1. 用户开始 vibe coding。
2. 用户选择角色、形象、名字和公开 handle。
3. 用户复制 Agent 注册指令给自己的 Agent。
4. Agent 读取授权范围内的本地 Skill、项目痕迹、DoneGraph receipt。
5. Agent 返回 `VC-AUTH-*` 授权码或 `vibecraft.registration.v1` JSON proof。
6. Web 端验证并生成 Village Pass，确认初始等级。
7. 用户继续用 Agent build。
8. Agent 完成工作后上传或写入 completion proof / receipt。
9. 系统生成 Today Drop：成果、概念、小坑、证据、下一步。
10. 用户点击不懂的知识方块，进入主动探索。
11. 系统用普通语言解释，并补充术语备注。
12. 用户把多个知识方块合成为“我懂了”卡片。
13. 系统更新技能树、Vibe Insight、Vibe Radio、Vibe Bio 和 Vibe Brain。
14. 用户在灵感村展示身份、发起合作、授权 Agent。
15. 下一次 build 时，Agent 读取用户授权的大脑包，继续以用户能懂的方式协作。

## 9. 核心模块需求

### 9.1 Happy Build World / 快乐建造世界

目标：

把严肃的 AI 编程过程变成可探索、可移动、可互动的方块世界。

核心能力：

- 首页展示用户当前项目岛屿或世界入口。
- 每个项目是一个区域，每个功能是一个建筑、地块、树、矿洞或装置。
- 每次完成 build 后，世界中出现新的方块、箱子、告示牌、掉落物。
- 用户能看到“今天我造了什么”“我学到了什么”“我下次去哪”。
- 世界必须是真实能动的可玩场景，而不是静态示意图。

MVP 已定交互：

- Phaser-powered 可玩世界。
- 玩家可移动。
- 位置包含 Spawn、Goal Tree、Knowledge Mine、Crafting Table、Radio Tower、Vibe Lens、Brain Vault、Vibe Village。
- 未注册用户可探索 Spawn、Radio、Vibe Lens。
- Goal Tree、Knowledge Mine、Crafting Table、Brain Vault、Vibe Village 需要 Village Pass。

关键文案：

> 技术不是黑盒，是可以捡、可以挖、可以合成的知识方块。

### 9.2 Goal Tree / 目标树

目标：

把“一个开发目标正在被 Agent 完成”变成游戏中可见的进度。

逻辑：

- 用户有一个目标。
- 在世界里，这个目标是一棵树。
- 用户角色砍树。
- 树的生命值表示开发进度。
- Agent 完成 proof 会让树掉血、掉落物、增加 XP。
- 当目标完成上线，树被砍倒，生成成就、故事和公开进展。

验收：

- 未注册用户点击 Goal Tree 时提示需要 Village Pass。
- 注册后可以砍树。
- 砍树后 tree health、XP、drops、Daybook、Radio context 更新。

### 9.3 Today Drop / 今日掉落

目标：

每次 AI 工作结束，都给用户一个轻量、可爱的复盘入口。

掉落类型：

- 成果方块：今天完成了什么。
- 证据方块：测试、截图、文件、命令、人工确认。
- 概念方块：今天出现了哪些新知识。
- 小坑方块：哪里还不确定。
- 下一步告示牌：明天回来先做什么。

用户价值：

- 不用重翻聊天记录。
- 一眼知道今天有没有真的推进。
- 把项目进展变成可收藏的记忆。

### 9.4 Vibe Sticker / 项目贴纸

目标：

把 AI 工作记录翻译成普通人愿意看的“工作小票”。

贴纸示例：

- 菜端上桌：这件事已经有成果。
- 作业本盖章：这件事有证据支撑。
- 雾里别跑：这里还没验证，先别当真。
- 冰箱便签：明天回来先看它。
- 语言翻译器：这个术语需要换成人话。

贴纸详情必须包含：

- 这是什么。
- 为什么这么判断。
- 能不能信。
- 用户下次怎么用。
- 来源证据。

### 9.5 Active Exploration / 主动探索

目标：

用户可以主动点开任何看不懂的部分，以自己能懂的方式学习。

触发入口：

- 点击一个代码文件。
- 点击一个报错。
- 点击一个术语。
- 点击一个功能模块。
- 点击一个知识方块。
- 上传截图或拍照识别某个界面/单词/概念。
- 在 Vibe Lens 中扫描现实世界内容。

解释层级：

1. 像朋友解释：一句话讲明白。
2. 生活类比：这像什么。
3. 技术备注：专业术语是什么。
4. 项目关联：它在我这个项目里有什么用。
5. 可操作下一步：我现在该点哪里、改哪里、问什么。

示例：

- 专业术语：API
- 人话解释：一个服务开出来的点餐窗口。你告诉它要什么，它按规则把结果端回来。
- 项目备注：你这里调用的是 AI 模型的点餐窗口。
- 下一步：先确认 key、请求地址、返回格式。

### 9.6 Vibe Lens / 拍照学习入口

目标：

把“拍照学单词”式交互迁移到 vibe coding 场景里。

用户可以：

- 拍摄屏幕、白板、笔记、单词、错误信息、页面草图。
- 上传截图。
- 让 Agent/OCR/视觉模型提取可学习对象。
- 将结果变成 Knowledge Block。

MVP：

- 提供 camera modal。
- Scan Into World 后生成 `LENS-BLOCK`。
- 展示“会在下一步变成知识方块”的反馈。

未来：

- OCR。
- 截图理解。
- UI/代码/错误解释。
- 与 Crafting Table、Skill Tree、Vibe Brain 联动。

### 9.7 Crafting Table / 知识合成台

目标：

把零散知识合成为用户自己的理解。

合成规则：

- 3 个相关概念方块可以合成 1 张理解卡。
- 1 个成果方块 + 1 个证据方块 + 1 个小坑方块，可以合成项目小结。
- 多张理解卡可以升级技能树节点。

合成产物：

- 我懂了卡片。
- 项目说明卡。
- Debug 经验卡。
- 可复用 Prompt。
- 下次给 Agent 的说明书。

### 9.8 Vibe Radio / Vibe FM / 创作收音机

目标：

给用户情绪价值、复盘陪伴和项目记忆点。

核心功能：

- 每天生成 30-60 秒的文字播报。
- 语气像“创作电台”，轻松、有陪伴感。
- 总结今天造了什么、学了什么、还差什么。
- 可一键转语音或生成短视频文案。

MVP 已定能力：

- 在世界中有 Radio Tower。
- Radio UI 包含 station frequency、episode title、broadcast text、waveform animation、broadcast queue、play、next station。
- 当前频道：
  - Morning Build Recap
  - Knowledge Block Radar
  - Village Signal
- Episode 根据以下状态生成：
  - Village Pass 状态
  - builder name
  - Goal Tree health
  - drops
  - active event
- 播报后 Daybook 生成 recap。
- 点击时有 SFX。

示例：

> 这里是 VibeCraft FM。今天你在灵感工坊里点亮了三个新方块：一个功能、一个证据、一个还没完全看清的小坑。明天回来先看告示牌，不用重翻聊天记录。

未来：

- TTS 语音。
- 背景音乐混音。
- 分享为短视频文案/海报。
- 用户可选择解释风格：像朋友、像老师、像游戏 NPC、像电台主播。

### 9.9 Daybook / 每日日志

目标：

承接星露谷式“日常积累感”。

功能：

- 显示当天 Build Day。
- 显示 Village Pass 状态。
- 显示 Goal Tree 进度。
- 显示 drops。
- 记录最新世界事件。
- 接收 Radio recap。

设计要求：

- 不要挤爆 playable world。
- 默认精简，展开后显示更多。
- 文案要像正式产品里的游戏日志，不要像内部开发备注。

### 9.10 Vibe Insight / 灵感小镜子

目标：

从用户做的项目和表达里提炼积极、正向、可行动的创作洞察。

输出维度：

- 创作气质：你常把抽象问题变成什么形式。
- 判断方式：你如何判断一个东西是否有趣/可信。
- 协作习惯：你如何给自己、队友或 Agent 留路标。
- 当前优势：你这段时间最值得放大的能力。

安全边界：

- 不输出负面人格标签。
- 不做心理诊断。
- 不预测用户命运。
- 不评价用户价值高低。
- 所有结论都要绑定具体项目证据。
- 用户可以编辑或隐藏对外展示版本。

### 9.11 Skill Tree / 技能树

目标：

让用户越用越清楚“我是什么类型的 AI 创作者”。

技能树示例：

- Prompt 表达
- 产品拆解
- UI 审美
- 前端拼装
- Debug 追踪
- 自动化流程
- 数据整理
- 故事表达
- 社区协作
- Agent 指挥

等级系统：

- Lv.1 发现：出现过相关知识方块。
- Lv.2 理解：完成过合成卡。
- Lv.3 应用：在项目里实际使用过。
- Lv.4 复用：能迁移到另一个项目。
- Lv.5 教别人：能用普通话解释给别人。

### 9.12 Vibe Village / 灵感村社区

目标：

用户入驻后，通过使用产品解锁模块、等级、技能包和身份标签，并基于互补发起合作。

核心功能：

- 个人主页：展示技能树、代表项目、今日掉落、Vibe Insight。
- 社区身份卡：展示 avatar、handle、role、level、skill packs、recent works。
- 身份标签：如“产品脑洞型 builder”“视觉表达型 builder”“Debug 耐心型 builder”。
- 技能包：用户可以收藏、购买、发布自己的可复用技能包。
- 合作邀请：用户看到互补技能后发起项目合作。
- 灵感村公告板：发布“我有想法缺前端”“我会视觉缺产品结构”等邀请。
- 人物化社区：用户不是列表里的卡片，而是世界里的角色/NPC/村民。

合作匹配逻辑：

- 根据技能树互补度。
- 根据项目兴趣相似度。
- 根据协作习惯匹配。
- 根据近期活跃度。

### 9.13 Vibe Bio / AI 时代名片

目标：

让用户的名字成为其 AI 时代 vibe 作品名片。

路径：

```text
username.vibecraft.bio
```

展示内容：

- 用户介绍。
- 角色和人物形象。
- 代表作品。
- Village Pass 状态。
- 技能树摘要。
- 已解锁技能包。
- Today Drop / Vibe Sticker 摘要。
- Vibe Radio 精选播报。
- Vibe Insight 正向洞察。
- 合作邀请入口。

要求：

- 用户可编辑公开文案。
- Proof-backed 的等级/掉落/技能包不能手动伪造。
- 默认英文，支持中文。
- URL handle 需要校验和保留规则。

### 9.14 Agent-only Registration / Agent 注册

目标：

注册仅允许 Agent 完成，让它成为 AI-native 产品体验的一部分，而不是普通账号表单。

流程：

1. 用户在前台/工坊填写名字、handle、角色、头像。
2. Web 端生成一段 Agent 指令。
3. 用户复制给自己的 Codex/Agent。
4. Agent 读取授权范围内本地 Skill、DoneGraph 项目痕迹和完成证据。
5. Agent 返回 `VC-AUTH-*` 授权码或 `vibecraft.registration.v1` JSON proof。
6. 用户将授权码/JSON 贴回页面。
7. Web 端验证后创建 Village Pass。
8. Village Pass 成为社区卡片和可玩世界解锁条件。

校验要求：

- 支持纯 `VC-AUTH-*`。
- 支持被换行/空格打断的授权码。
- 支持 fenced/full JSON proof。
- 如果用户把原始 Agent 指令贴回来，要明确提示“这不是 Agent 返回值”。
- 如果授权码与当前 handle 不一致，要解释是哪一个 ID 不一致。
- 对普通用户不要暴露太多 JSON 细节。

### 9.15 Completion Proof Upload / Agent 完成状态同步

目标：

让 Agent 完成 Web/build 后，把状态同步到 VibeCraft，触发解锁、掉落和世界变化。

MVP 交互：

- Agent 生成 `vibecraft.receipt.v1`。
- 用户复制/导入 receipt。
- Web 端同步后更新：
  - Today Drop
  - Goal Tree
  - skill packs
  - Daybook
  - Vibe Radio
  - Vibe Bio
  - Vibe Brain

未来：

- API route：`POST /api/vibecraft/receipts`
- receipt 签名。
- 自动部署后回传 proof。
- 多 Agent 来源。
- 可撤销/可审计同步记录。

### 9.16 Vibe Brain / 进化大脑

目标：

把用户在 VibeCraft 上的长期积累炼化为用户可拥有、可下载、可授权给 Agent 的个人大脑包。

包含内容：

- 用户项目记忆。
- 用户偏好的解释方式。
- 用户常用 Prompt。
- 用户技能树。
- 用户理解卡。
- 用户授权过的 Agent 交互摘要。
- 用户正向创作洞察。
- 用户 public works 和 receipts。

授权机制：

- 用户拥有下载 key。
- 用户可以生成临时授权 key 给任意 Agent。
- Agent 只能读取用户授权范围内的大脑包。
- 用户可以撤销授权。
- 用户可以导出、备份、删除。

区块链云端设计原则：

- 不把原始隐私数据直接写到链上。
- 链上只记录哈希、授权凭证、版本证明和访问审计。
- 原始大脑包加密存储在云端或去中心化存储层。
- 解密 key 由用户掌握。
- Agent 访问必须经过用户显式授权。

MVP 表达边界：

不要在产品主文案中过度承诺“区块链云端”。MVP 先展示“我的大脑包”和“我的钥匙”，底层链上/去中心化存储作为后续 trust/provenance 方案。

用户价值：

> 我的 AI 记忆不是散落在不同聊天窗口里，而是变成我自己的可携带大脑。

## 10. 用户流程

### 10.1 新用户首次体验

1. 用户进入 VibeCraft。
2. 前台解释：这是给 AI 时代 builder 的 Happy Build 世界。
3. 用户选择身份：我想用 AI 做网页 / 工具 / 游戏 / 内容 / 自动化。
4. 用户选择角色、人物形象、名字、handle。
5. 用户复制 Agent 注册指令。
6. Agent 返回授权码或 JSON proof。
7. 用户贴回页面，创建 Village Pass。
8. 系统生成第一张社区身份卡。
9. 系统生成第一座项目岛或初始世界。
10. 用户进入 playable world，看到 Goal Tree、Radio Tower、Vibe Lens 等地点。

### 10.2 日常 build 流程

1. 用户打开当前项目岛。
2. 用户在 Codex/Agent 中进行创作。
3. Agent 完成任务并生成 completion proof。
4. VibeCraft 同步项目变化、命令、文件摘要、proof。
5. Build 结束后生成 Today Drop。
6. 用户查看成果、证据、小坑、下一步。
7. 用户点击不懂的方块主动探索。
8. 用户合成理解卡。
9. Vibe Radio 播报今日进展。
10. Daybook 记录最新事件。
11. 技能树、Vibe Bio 和 Vibe Brain 自动更新。

### 10.3 社区协作流程

1. 用户进入灵感村。
2. 浏览其他用户的角色、技能树和代表项目。
3. 系统推荐互补用户。
4. 用户发起合作邀请。
5. 双方选择共享哪些项目贴纸、技能卡或大脑包摘要。
6. 合作完成后生成共同项目岛和协作贴纸。

### 10.4 Agent 授权流程

1. 用户进入 Vibe Brain。
2. 选择要授权给某个 Agent 的范围。
3. 生成临时 key。
4. Agent 下载加密大脑包摘要。
5. Agent 按用户偏好的表达方式协作。
6. 用户可查看访问记录并撤销授权。

## 11. 用户故事

Story 1：生成今日掉落  
Given 用户完成了一次 vibe coding  
When 用户点击结束或 Agent 上传 completion proof  
Then VibeCraft 生成 Today Drop，包括成果、证据、概念、小坑和下一步

Story 2：主动探索概念  
Given 用户看到一个不懂的知识方块  
When 用户点击“挖一下”  
Then 系统用普通语言、生活类比、术语备注和项目关联解释它

Story 3：合成理解  
Given 用户已经收集多个相关知识方块  
When 用户拖到合成台  
Then 系统生成一张“我懂了”理解卡，并更新技能树

Story 4：查看正向洞察  
Given 用户完成多个项目或多次 build  
When 用户打开 Vibe Insight  
Then 系统输出积极、具体、可行动的创作洞察，并说明证据来源

Story 5：社区找互补伙伴  
Given 用户已有技能树和身份标签  
When 用户进入灵感村  
Then 系统推荐互补用户，并支持发起合作邀请

Story 6：授权 Agent 读取大脑  
Given 用户已经形成 Vibe Brain  
When 用户生成授权 key  
Then 指定 Agent 可以读取授权范围内的大脑包，并在协作中使用用户偏好

Story 7：Agent-only 注册  
Given 用户复制注册指令给 Agent  
When Agent 返回 `VC-AUTH-*` 或 JSON proof  
Then Web 端验证并创建 Village Pass

Story 8：Goal Tree 进度  
Given 用户有一个正在开发的目标  
When Agent 上传 completion proof  
Then Goal Tree 进度变化，掉落物、Daybook、Vibe Radio 和技能树同步更新

Story 9：公开 AI 时代名片  
Given 用户选择 handle  
When 访问 `username.vibecraft.bio`  
Then 访客能看到用户介绍、作品、技能、掉落、正向洞察和合作入口

## 12. 信息架构

### 12.1 主要页面

1. 首页 / Front Stage  
   解释世界、产品定位、公开 handle、Agent proof 机制和进入工坊路径。

2. Playable World / 项目岛  
   展示当前项目、Goal Tree、Radio Tower、Vibe Lens、Village、Daybook、背包。

3. Register / Agent 注册  
   角色、形象、handle、Agent 指令、授权码验证、Village Pass。

4. Today Drop 页面  
   展示本次 build 产物：成果、证据、概念、小坑、下一步。

5. 探索矿洞  
   用户主动学习概念、报错、代码片段、截图内容。

6. 合成台  
   把知识方块合成为理解卡、项目卡、Prompt 卡。

7. 技能树  
   展示用户能力成长路径和等级。

8. Vibe Radio  
   频道、节目单、播报、历史回放、分享。

9. Vibe Brain  
   管理个人大脑包、导出、授权、撤销、访问记录。

10. 灵感村  
   展示社区用户、技能包、合作公告、互补推荐。

11. Vibe Bio / 个人主页  
   `username.vibecraft.bio`，展示用户身份、代表项目、技能树、正向洞察、合作入口。

### 12.2 核心对象

- User：用户
- Public Handle：公开 ID
- Village Pass：灵感村通行证
- Project：项目
- Build Session：一次创作过程
- Agent Registration Proof：Agent 注册证明
- Completion Receipt：完成凭证
- Knowledge Block：知识方块
- Sticker：项目贴纸
- Evidence：证据
- Insight：正向洞察
- Skill Node：技能节点
- Growth Pack / Skill Pack：成长包 / 技能包
- Craft Card：合成卡
- Daybook Entry：每日记录
- Radio Episode：电台播报
- Brain Pack：大脑包
- Agent Grant：Agent 授权
- Collaboration Invite：合作邀请

## 13. MVP 范围

### 13.1 MVP 必做

1. Agent-only 注册  
   支持复制指令、Agent 返回授权码/JSON、Web 验证 Village Pass。

2. 角色与人物形象  
   用户选择角色、avatar、名字、handle，形成社区身份卡。

3. 可玩世界  
   使用 Phaser 实现真实可动的 voxel sandbox 场景，不是静态图。

4. Goal Tree  
   目标以树的形式呈现，Agent proof 转化为树进度、掉落、XP。

5. Today Drop  
   自动生成成果、证据、概念、小坑、下一步。

6. Vibe Sticker  
   把项目进展转化为可爱的项目贴纸。

7. 主动探索  
   用户点击一个概念或报错，获得人话解释和项目关联。

8. Vibe Lens 基础版  
   支持 camera/scan placeholder，把现实输入变成 Knowledge Block。

9. 合成台基础版  
   支持把多个知识方块合成为一张理解卡。

10. Vibe Radio 基础版  
   支持频道、播报、动态文案、waveform、Daybook recap。

11. Vibe Insight 基础版  
   输出积极、正向、可行动的创作洞察。

12. 技能树基础版  
   根据知识方块、合成卡、Agent receipt 点亮技能节点。

13. Vibe Bio 预览  
   支持 `username.vibecraft.bio` 的信息结构与路由设计。

14. Vibe Brain 预览  
   展示用户拥有、导出、授权、撤销的概念。

15. Demo 页面  
   用原创 voxel 风格展示产品世界；默认英文，支持中文。

### 13.2 MVP 可砍

- 完整账号体系。
- 真实链上系统。
- 复杂社区推荐。
- 多人实时协作。
- 移动端原生 App。
- 语音版 Vibe FM。
- 技能包交易市场。
- 完整 OCR / image understanding。

### 13.3 MVP 不做

- 不做负面人格分析。
- 不承诺自动理解所有代码。
- 不做专业 IDE 替代品。
- 不把所有聊天记录无差别上传云端。
- 不在产品主页面暴露 PRD、黑客松结构或内部说明。
- 不用官方 Minecraft 素材、角色、logo 或贴图，除非有正式授权。

## 14. 设计与交互要求

### 14.1 视觉方向

关键词：

- voxel
- 方块沙盒
- 挖矿
- 合成
- 背包
- 技能树
- 村庄
- 快乐建造

视觉原则：

- 第一眼像一个能玩的知识世界，而不是 SaaS 看板。
- 用方块、背包、告示牌、箱子、矿洞承载信息。
- 避免软萌贴纸过头，保持“可爱但有力量”。
- 避免所有场景一次性铺满，改用开放世界探索。
- 页面不能像 PRD，也不能像半成品调试 HUD。
- 参考方块沙盒的信息密度、边框、物品格、地图、角色面板，但使用原创素材。

### 14.2 交互原则

- 用户看到知识方块时，应自然想点一下。
- 每个术语都应该有“人话解释”。
- 每个成果都应该有“证据”。
- 每个小坑都应该有“下一步”。
- 每个洞察都应该能追溯来源。
- 每次使用都应该让用户身份更清晰。
- 用户在 Web 端操作少，Agent 完成工作后触发解锁。
- 开放世界中模块应通过探索发现，而不是全铺成卡片。

### 14.3 关键微交互

- 方块掉落：build 完成后从空中掉下知识方块。
- 挖矿解释：点击未知概念，出现逐层解释。
- 合成动画：多个方块合成理解卡。
- 技能树点亮：完成应用后节点发光。
- 收音机播报：结束时生成 Vibe Radio。
- 授权钥匙：给 Agent 生成可撤销 key。
- 点击音效：所有重要按钮、物品格、世界对象有反馈。
- 默认音乐：打开网页默认尝试播放背景音乐，但遵守浏览器 autoplay 限制。

## 15. 成功指标

### 15.1 激活指标

- 新用户首次完成 Agent-only 注册的比例。
- 新用户生成第一个 Village Pass 的比例。
- 新用户进入 playable world 的比例。
- 新用户点击第一个知识方块的比例。
- 新用户完成第一次合成的比例。

### 15.2 留存指标

- D1 / D7 回访率。
- 每用户每周 build session 数。
- 每用户每周主动探索次数。
- 用户是否在第二天查看昨日告示牌/Daybook。
- 用户是否播放 Vibe Radio 回顾。

### 15.3 学习指标

- 每用户生成的理解卡数量。
- 技能树节点点亮数量。
- 用户对解释“我懂了”的反馈比例。
- 同一概念被复用到新项目的次数。

### 15.4 协作指标

- Vibe Bio 访问数。
- 合作邀请发送数。
- 合作邀请接受率。
- 互补技能匹配后的项目启动数。

### 15.5 商业指标

- 免费用户到 Pro 转化率。
- 技能包购买率。
- Vibe Brain 云存储付费率。
- Agent 授权调用次数。
- 社区协作佣金收入。

### 15.6 信任与安全指标

- 用户撤销授权成功率。
- 用户导出大脑包成功率。
- 用户对洞察“不冒犯/不越界”的反馈。
- 错误解释被用户标记的比例。
- Agent proof 粘贴成功率。
- 掉落/等级是否都有 receipt/evidence 可追溯。

## 16. 商业化路径

### 16.1 阶段一：免费上岛

目标：

降低门槛，让用户快速体验“知识掉落”和“世界变化”的快乐。

免费能力：

- 单项目导入。
- Agent-only 注册。
- 基础 Today Drop。
- 少量知识方块。
- 基础技能树。
- 基础 Vibe Radio。
- 本地 stickerbook 导出。

转化触发：

- 用户想管理多个项目。
- 用户想保存长期技能树。
- 用户想使用更多解释风格。
- 用户想使用 Vibe Brain。
- 用户想拥有更完整的 `username.vibecraft.bio` 名片。

### 16.2 阶段二：Pro 订阅

Pro 能力：

- 多项目岛屿。
- 无限 Today Drop。
- 高级主动探索。
- 自定义解释风格。
- 技能树深度分析。
- Vibe Radio 历史回放。
- Vibe Brain 基础云同步。
- Vibe Bio 自定义域名/主题。

### 16.3 阶段三：技能包商店

技能包类型：

- UI 审美技能包。
- Debug 技能包。
- 产品 PRD 技能包。
- 小红书/短视频创作技能包。
- 黑客松 Demo 技能包。
- Agent 指挥技能包。
- Vibe Radio 主播风格包。

收入方式：

- 官方技能包售卖。
- 创作者技能包分成。
- 主题世界付费皮肤。

### 16.4 阶段四：灵感村协作

收入方式：

- 合作项目撮合佣金。
- 团队空间订阅。
- 社区活动/黑客松工具包。
- 企业/学校 cohort 版。

### 16.5 阶段五：Vibe Brain 云端与 Agent 授权

收入方式：

- 大脑包云存储。
- 高级加密与版本管理。
- Agent 授权调用计费。
- 跨工具记忆同步。
- 专属 Agent 训练摘要。

长期商业判断：

> VibeCraft 的长期资产不是课程，也不是看板，而是用户愿意持续沉淀的个人创作大脑。

## 17. 数据与隐私

### 17.1 数据最小化

只收集完成产品功能所需的信息：

- 项目结构摘要。
- 用户主动授权的对话片段。
- 文件变化摘要。
- 命令和验证结果。
- Agent registration proof。
- Completion receipt。
- 用户生成的知识方块、贴纸、理解卡。

### 17.2 用户控制

必须支持：

- 导出全部数据。
- 删除全部数据。
- 查看 Agent 访问记录。
- 撤销 Agent 授权。
- 选择哪些项目进入 Vibe Brain。
- 选择哪些洞察展示到社区。
- 区分 public profile 与 private brain。

### 17.3 安全边界

- 不把隐私项目默认公开。
- 不把原始代码默认上传社区。
- 不把大脑包明文写入链上。
- 不向 Agent 开放超出授权范围的数据。
- 不将人格洞察用于负面评价或不可解释评分。

## 18. 技术方向

### 18.1 MVP 技术架构

前端：

- Web 单页应用。
- voxel 风格 UI。
- Phaser playable world。
- 项目岛、贴纸墙、技能树、合成台、Vibe Bio、Vibe Radio。
- localStorage 保存 demo 状态。

本地采集：

- 读取 git diff。
- 读取命令执行记录。
- 读取用户手动输入。
- 读取项目文件摘要。
- 读取 DoneGraph receipt。
- 读取本地 Skill 索引。

AI 处理：

- session 摘要。
- 知识方块抽取。
- 人话解释生成。
- 贴纸分类。
- 正向洞察生成。
- Vibe Radio episode 生成。

存储：

- 本地 Markdown / JSON。
- Browser localStorage for prototype。
- 后续扩展云端同步。

### 18.2 Agent Bridge

当前静态 bridge：

- `vibecraft-agent-bridge.js`
- `vibecraft.registration.v1`
- `vibecraft.receipt.v1`
- `agent-registration.example.json`
- `agent-receipt.example.json`

后续 API：

- `POST /api/vibecraft/registration/challenge`
- `POST /api/vibecraft/registration/verify`
- `POST /api/vibecraft/receipts`
- `GET /api/vibecraft/profile/:handle`
- `POST /api/vibecraft/brain/grants`

### 18.3 后续技术架构

- 用户账号与项目空间。
- Vibe Brain 加密存储。
- Agent 授权 API。
- 技能包市场。
- 社区推荐系统。
- 子域名路由。
- 链上凭证/哈希/授权审计。

## 19. 发布计划

### 19.1 Hackathon Demo

目标：

让评委 10 秒内理解“AI 创作也可以像方块沙盒一样快乐学习”。

必须展示：

- 方块沙盒首页。
- Agent-only 注册。
- 可玩世界。
- Goal Tree。
- Today Drop。
- 主动探索一个概念。
- 合成一张理解卡。
- 技能树点亮。
- Vibe Radio。
- Vibe Bio。
- Vibe Brain 授权概念。
- 灵感村协作与商业化路径。

### 19.2 Alpha

目标：

服务 20-50 个真实 vibe coding 用户。

重点验证：

- 用户是否愿意导入项目。
- 用户是否能完成 Agent-only 注册。
- 用户是否觉得解释真的更容易懂。
- 用户是否愿意第二天回来。
- 用户是否愿意展示技能树和 Vibe Bio。

### 19.3 Beta

目标：

形成稳定创作循环和早期社区。

重点：

- 多项目管理。
- 技能包雏形。
- 灵感村合作邀请。
- Vibe Brain 导出/授权。
- Radio episode 历史。

### 19.4 V1

目标：

推出 Pro 订阅、技能包商店、Vibe Brain 云端、公开子域名和社区协作。

## 20. 风险与应对

### 20.1 风险：太像游戏，用户不觉得有用

应对：

- 每个方块都绑定真实项目证据。
- 每次掉落都必须能帮助用户继续 build。
- 强调“快乐学习引擎”，不是纯装饰游戏。

### 20.2 风险：解释不准确

应对：

- 每条解释显示可信度或证据来源。
- 允许用户标记“没懂/不对”。
- 对高风险技术建议提供验证步骤。
- 保留来源证据。

### 20.3 风险：人格洞察越界

应对：

- 只输出正向、非诊断、可行动观察。
- 每条洞察必须引用项目证据。
- 允许用户关闭或删除洞察。

### 20.4 风险：区块链叙事太重

应对：

- 对普通用户只说“我的大脑包”和“我的钥匙”。
- 底层链上只做凭证和审计，不把它作为主卖点。
- Demo 先展示授权体验，不展示复杂链概念。

### 20.5 风险：社区冷启动

应对：

- 先围绕黑客松、AI 创作营、学习小队建立场景。
- 用技能树和项目岛降低破冰成本。
- 初期通过官方任务和技能包驱动合作。

### 20.6 风险：Agent-only 注册太难懂

应对：

- 前台负责讲清楚世界。
- 注册流只给用户一段清晰指令。
- Agent 返回授权码即可，不强迫 JSON。
- 错误提示必须说人话。
- 未来使用 API 管理 challenge，减少状态漂移。

### 20.7 风险：视觉质量不足

应对：

- 不再把所有模块做成卡片铺满。
- 用开放世界探索代替 dashboard 堆叠。
- 每次发布前必须做桌面/移动截图 QA。
- 首屏必须有动态、有世界感、有角色和可交互对象。

## 21. 开放问题

1. VibeCraft 首发应该做浏览器插件、CLI、Web App，还是接入 Codex/Cursor 的工作流？
2. 用户的第一批知识方块来自项目文件、对话记录，还是用户主动输入？
3. Vibe Brain 的早期版本是否先做本地导出，晚一点再做云端？
4. 社区身份展示要偏作品集，还是偏游戏角色面板？
5. 技能包商店是官方先做，还是允许用户从第一天发布？
6. 解释风格是否允许用户选择：像朋友、像老师、像游戏 NPC、像电台主播？
7. 如何定义“用户真的懂了”：点击确认、复述、复用，还是项目中成功应用？
8. `username.vibecraft.bio` 首发是静态路由、动态路由，还是真实子域名解析？
9. Agent completion proof 首发是复制 JSON、浏览器插件写入，还是 API 上传？
10. Vibe Radio 首发是否需要真实 TTS，还是文字播报 + 声音反馈即可？
11. 视觉方向在“原创 voxel sandbox”和“接近方块沙盒体验”之间的边界如何把握？

## 22. Demo 讲法

### 22.1 10 秒版本

VibeCraft 是给非技术 AI 创作者的 Happy Build 世界。你用 AI 做项目，它把过程变成知识方块、技能树、创作电台和进化大脑，让知识以可爱的方式进入你的脑袋。

### 22.2 30 秒版本

现在很多人会用 AI 写代码，但做完之后其实没真的懂。VibeCraft 把 vibe coding 变成一个像方块沙盒一样的学习世界：每次 build 后掉落成果、概念、小坑和下一步。你可以主动挖不懂的知识，把它合成自己的理解，点亮技能树，最后形成可授权给 Agent 的个人大脑。

### 22.3 3 分钟版本

1. 问题：AI 已经能帮我们生成，但生成之后，人怎么理解、复盘、成长？
2. 用户：非技术语言创作者，想用 AI 做产品、网页、工具、游戏，但不想先上枯燥编程课。
3. 方案：VibeCraft 把 AI 创作过程变成方块沙盒世界。
4. 演示 Agent-only 注册：复制指令给 Agent，拿回 Village Pass。
5. 演示 playable world：任务变成 Goal Tree，Agent proof 让世界变化。
6. 演示 Today Drop：今天完成了什么、掉落了什么知识、哪里还有小坑。
7. 演示主动探索：点击一个不懂的概念，系统用人话解释，再给术语备注。
8. 演示 Vibe Radio：把今天的进展变成创作收音机播报。
9. 演示合成台：把几个知识方块合成“我懂了”卡。
10. 演示技能树：越 build，身份越清晰。
11. 演示 Vibe Bio：用户名就是 AI 时代作品名片。
12. 演示 Vibe Brain：长期积累变成用户拥有的大脑包，可授权给 Agent。
13. 演示灵感村：用户基于技能树找到互补伙伴。
14. 收尾：这不是编程课，也不是项目管理表，而是一个让人快乐长脑子的 AI 创作世界。

## 23. 产品介绍文案

标题：

> VibeCraft / 灵感工坊

主文案：

> 用 AI 造东西，把自己也升级。

副文案：

> 给非技术创作者的 Happy Build 可视化学习引擎。每次 vibe coding 后，VibeCraft 会掉落知识方块、项目贴纸和下一步告示牌；你可以主动探索不懂的部分，把它合成自己的理解，点亮技能树，进化成可授权给 Agent 的个人大脑。

核心卖点：

- 快乐建造：把 AI 创作变成方块沙盒世界。
- 可爱学习：知识以奇怪但好记的形式进入脑袋。
- 主动探索：哪里不懂点哪里，用人话解释。
- Agent 注册：用一段指令让 Agent 生成你的 Village Pass。
- 创作收音机：把进展变成有情绪价值的 Vibe Radio。
- 持续进化：每次 build 都更新技能树和 Vibe Brain。
- 公开名片：`username.vibecraft.bio` 展示你的作品、技能和身份。
- 社区协作：身份越清晰，越容易找到互补队友。

## 24. PRD 结论

VibeCraft 的真正机会，不是再做一个 AI 编程工具，而是占据 AI 创作之后的成长层。

当越来越多人可以用 AI 做出东西，差异会从“谁会写代码”转向：

- 谁更会提出好问题。
- 谁更会理解 AI 做了什么。
- 谁更能沉淀自己的创作大脑。
- 谁更能和 Agent、伙伴持续协作。
- 谁能把自己的 AI 作品、证据和能力变成可被他人理解的身份。

VibeCraft 要成为这群人的 Happy Build 世界：

> 让每一次 AI 创作，都变成一次快乐长脑子的冒险。

