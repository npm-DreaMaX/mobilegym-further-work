# Daily App 15 Benchmark Matrix

> 每个 App 规划 ≥15 个 benchmark task。字段：task_id / objective / difficulty / description 模板 / setup 注入 / 判定方式 / AnswerSheet / side effect 检查 / 预期改 runtime state / 不应改 state。
> objective: operate=query/operate/hybrid。difficulty: L1–L4。判定方式简写：`criteria`=`CriteriaTask` criteria dict；`answer`=`AnswerTask` get_answer+match_value；`custom`=`BaseTask` 自定义 check_goals。
> 范式来源见 `EXEMPLAR_APP_AND_BENCHMARK_AUDIT.md`（Weather=AnswerSheet、Wechat=id-diff、Ebay=快照、Railway=全链路、Spotify=create-then-mutate）。

---

## 1. Wallet（卡包）

| task_id | obj | diff | description 模板 | setup 注入 | 判定 | AnswerSheet | side effect 检查 | 预期改 state | 不应改 state |
|---|---|---|---|---|---|---|---|---|---|
| wallet.check_default_card | query | L1 | 查看默认卡是哪张 | 无 | answer 读 defaultCardId | 是(text 卡名) | 无 | 无 | cards |
| wallet.check_card_count | query | L1 | 查看共有几张卡 | 无 | answer count cards | 是(number) | 无 | 无 | cards |
| wallet.check_card_balance | query | L1 | 查看{card}的余额 | name 采样 | answer 读 cards[name].balance | 是(number) | 无 | 无 | cards |
| wallet.set_default_card | operate | L1 | 把{card}设为默认卡 | name 采样,_invert | criteria defaultCardId | 否 | criteria 派生 | defaultCardId | cards[]内容 |
| wallet.toggle_theme | operate | L1 | 把主题切换到{theme} | theme 翻转 | criteria settings.themeId | 否 | criteria 派生 | settings.themeId | cards |
| wallet.add_card | operate | L2 | 添加一张{type}卡 | type 采样 | custom check_card_exists | 否 | expected_changes cards[+1] | cards | starredIds |
| wallet.sort_cards | operate | L2 | 把{cardA}排到{cardB}前面 | 翻转初始序 | criteria cards[].sortOrder._order | 否 | sortOrder._order | cards[].sortOrder | cards[]内容 |
| wallet.delete_card | operate | L2 | 删除{card} | name 采样 | custom diff init\current | 否 | cards[-=id] | cards | defaultCardId(若删默认卡则允许) |
| wallet.filter_by_type | query | L2 | 查看银行卡有几张 | 无 | answer count by type | 是(number) | searchHistory | searchHistory | cards |
| wallet.show_card_code | operate | L2 | 展示{card}的付款码 | name 采样 | criteria route=/card/:id/code | 否 | route | 无 | cards |
| wallet.compare_balances | query | L3 | {cardA}和{cardB}哪张余额多 | 两卡采样 | answer 比大小返 choice | 是(choice) | 无 | 无 | cards |
| wallet.scan_to_add | operate | L3 | 扫码添加卡 | 无 | custom check_card_exists | 否 | cards[+1] | cards | starredIds |
| wallet.redeem_coupon_card | operate | L3 | 使用{card}优惠券 | name 采样 | custom diff balance/状态 | 否 | cards/status | cards[name].status | user |
| wallet.find_oldest_card | query | L3 | 找出最早过期的卡 | 无 | answer 返卡名 | 是(text) | 无 | 无 | cards |
| wallet.multi_setting | operate | L2 | 同时开通知和深色模式 | 翻转 | criteria 2 项(参考 Map ModifyMultiSettings) | 否 | 2 criteria | settings.* | cards |

## 2. Duolingo

| task_id | obj | diff | description 模板 | setup 注入 | 判定 | AnswerSheet | side effect 检查 | 预期改 state | 不应改 state |
|---|---|---|---|---|---|---|---|---|---|
| duo.check_streak | query | L1 | 查看连续打卡几天 | 无 | answer user.streak | 是(number) | 无 | 无 | completedLessonIds |
| duo.check_xp | query | L1 | 查看我有多少XP | 无 | answer user.xp | 是(number) | 无 | 无 | completedLessonIds |
| duo.check_league | query | L1 | 查看我在哪个联赛 | 无 | answer user.league | 是(text) | 无 | 无 | completedLessonIds |
| duo.toggle_reminder | operate | L1 | {toggle}每日提醒 | 翻转 | criteria settings.reminder | 否 | criteria 派生 | settings.reminder | completedLessonIds |
| duo.complete_lesson | operate | L2 | 完成一节{skill}课 | skill 采样 | custom check completedLessonIds[+id] | 否 | completedLessonIds[+1] | completedLessonIds/user.xp | settings |
| duo.check_lesson_count | query | L2 | 查看{skill}有几节课 | skill 采样 | answer count lessons | 是(number) | 无 | 无 | completedLessonIds |
| duo.buy_streak_freeze | operate | L2 | 用{xp}买连续冻结 | 翻转 | custom diff xp/freeze | 否 | user.xp/user.streakFreeze | user.xp/user.streakFreeze | completedLessonIds |
| duo.daily_quest_progress | query | L2 | 查看今日任务进度 | 无 | answer dailyProgress | 是(number) | 无 | 无 | completedLessonIds |
| duo.find_highest_xp_skill | query | L3 | 哪个技能给XP最多 | 无 | answer skill name | 是(text) | 无 | 无 | completedLessonIds |
| duo.complete_n_lessons | operate | L3 | 完成{skill}的{N}节课 | skill/N 采样 | custom count[+N] | 否 | completedLessonIds[+N] | completedLessonIds/user.xp | settings |
| duo.compare_friends_xp | query | L3 | {friendA}和{friendB}谁XP高 | 两友采样 | answer choice | 是(choice) | 无 | 无 | leaderboard |
| duo.leaderboard_rank | query | L2 | 查看我在联赛排第几 | 无 | answer rank | 是(number) | 无 | 无 | leaderboard |
| duo.conditional_practice | hybrid | L4 | 如果streak超{N}天就开提醒否则关 | N 采样 | custom 条件判 settings.reminder(参考 Weather ConditionalAction) | 否 | settings.reminder | settings.reminder | completedLessonIds |
| duo.achieve_check | query | L2 | 查看已获得几个成就 | 无 | answer count achievements | 是(number) | 无 | 无 | completedLessonIds |
| duo.set_goal_xp | operate | L2 | 把每日XP目标设为{N} | N 采样 翻转 | criteria settings.dailyGoalXp | 否 | criteria 派生 | settings.dailyGoalXp | completedLessonIds |

## 3. GoogleDrive

| task_id | obj | diff | description 模板 | setup 注入 | 判定 | AnswerSheet | side effect 检查 | 预期改 state | 不应改 state |
|---|---|---|---|---|---|---|---|---|---|
| gdrive.check_storage | query | L1 | 查看存储已用多少 | 无 | answer storageUsage.used | 是(number) | 无 | 无 | files |
| gdrive.check_file_size | query | L1 | 查看{file}多大 | name 采样 | answer files[name].size | 是(number) | 无 | 无 | files |
| gdrive.count_recent | query | L1 | 查看最近文件有几个 | 无 | answer count recent | 是(number) | 无 | 无 | files |
| gdrive.search_file | query | L2 | 搜索包含{keyword}的文件 | keyword 采样 | custom check_searched+answer(参考 Ebay check_has_snapshot) | 是(text 文件名) | search.current/history/lastCompare | searchHistory | files |
| gdrive.filter_by_type | query | L2 | 查看{type}类型文件数 | type 采样 | custom check_has_snapshot+answer count | 是(number) | search.* | searchHistory | files |
| gdrive.star_file | operate | L2 | 收藏{file} | name 采样 翻转 | custom check starredIds | 否 | starredIds[+=id] | starredIds | files[]内容 |
| gdrive.delete_to_trash | operate | L2 | 删除{file}到回收站 | name 采样 | custom diff trash | 否 | files[-=id]/trash[+=id] | files/trash | starredIds |
| gdrive.sort_by_size | operate | L2 | 按大小排序 | 翻转 | criteria settings.sortOption | 否 | criteria 派生 | settings.sortOption | files |
| gdrive.compare_folder_counts | query | L3 | {folderA}和{folderB}哪边文件多 | 两夹采样 | answer 比较返 choice(参考 Ebay build_compare_counts_checks) | 是(choice) | search.* | searchHistory | files |
| gdrive.find_largest_file | query | L4 | 找最大的文件 | 无 | answer 返文件名+大小(参考 Ebay FindCheapestProduct) | 是(text+number) | search.* | searchHistory | files |
| gdrive.count_in_range | query | L3 | 大小在{min}-{max}的文件数 | 范围采样 | custom check_has_snapshot+answer count | 是(number) | search.* | searchHistory | files |
| gdrive.rename_file | operate | L2 | 把{file}重命名为{name} | 采样 翻转 | custom diff files[name] | 否 | files[name].name | files[name].name | starredIds |
| gdrive.restore_from_trash | operate | L3 | 从回收站恢复{file} | name 采样 | custom diff trash/files | 否 | trash[-=id]/files[+=id] | trash/files | starredIds |
| gdrive.check_shared_count | query | L2 | 查看共享文件有几个 | 无 | answer count shared | 是(number) | 无 | 无 | files |
| gdrive.toggle_view_mode | operate | L1 | 切换为{mode}视图 | mode 翻转 | criteria settings.viewMode | 否 | criteria 派生 | settings.viewMode | files |

## 4. Zhihu

| task_id | obj | diff | description 模板 | setup 注入 | 判定 | AnswerSheet | side effect 检查 | 预期改 state | 不应改 state |
|---|---|---|---|---|---|---|---|---|---|
| zhihu.check_answer_count | query | L1 | 查看{question}有几个回答 | q 采样 | answer count answers | 是(number) | 无 | 无 | likedAnswerIds |
| zhihu.check_author_followers | query | L1 | 查看{author}多少粉丝 | author 采样 | answer author.followers | 是(number) | 无 | 无 | followedAuthorIds |
| zhihu.like_answer | operate | L2 | 给{answer}点赞 | answer 采样 翻转 | custom check likedAnswerIds[+=id] | 否 | likedAnswerIds | likedAnswerIds | followedAuthorIds |
| zhihu.follow_question | operate | L2 | 关注{question} | q 采样 翻转 | criteria followedQuestionIds[+=id] | 否 | followedQuestionIds | followedQuestionIds | likedAnswerIds |
| zhihu.collect_to_set | operate | L2 | 把{answer}收藏到{collection} | 采样 | custom check collection trackIds(参考 Spotify) | 否 | collections[].trackIds | collections | likedAnswerIds |
| zhihu.search_content | query | L2 | 搜索{keyword}相关内容 | keyword 采样 | custom check_searched+answer | 是(text 标题) | searchHistory | searchHistory | likedAnswerIds |
| zhihu.check_collection_count | query | L2 | 查看{collection}有几条 | c 采样 | answer count | 是(number) | 无 | 无 | collections |
| zhihu.post_thought | operate | L2 | 发布想法：{content} | content 采样 | custom id-diff moments[+1](参考 Wechat PostMomentsText) | 否 | moments[+1] | moments | likedAnswerIds |
| zhihu.find_top_answer | query | L3 | {question}最高赞回答是谁写的 | q 采样 | answer author name | 是(text) | 无 | 无 | likedAnswerIds |
| zhihu.compare_followers | query | L3 | {authorA}和{authorB}谁粉丝多 | 两 author 采样 | answer choice | 是(choice) | 无 | 无 | followedAuthorIds |
| zhihu.list_followed_authors | query | L3 | 列出我关注的作者 | 无 | answer repeatable set(参考 Spotify ListLibraryArtists) | 是(text repeatable set) | 无 | 无 | followedAuthorIds |
| zhihu.toggle_theme | operate | L1 | 切换深色模式 | 翻转 | criteria settings.themeId | 否 | criteria 派生 | settings.themeId | likedAnswerIds |
| zhihu.check_topic_count | query | L2 | 查看{topic}下多少问题 | topic 采样 | answer count | 是(number) | 无 | 无 | likedAnswerIds |
| zhihu.collect_filter | operate | L3 | 把收藏夹里{author}的回答单独建夹 | author 采样 | custom diff collections | 否 | collections[+1] | collections | likedAnswerIds |
| zhihu.conditional_follow | hybrid | L4 | 如果{author}粉丝超{N}就关注否则取关 | N 采样 | custom 条件判 followedAuthorIds(参考 Weather ConditionalAction) | 否 | followedAuthorIds | followedAuthorIds | likedAnswerIds |

## 5. ChinaMobile

| task_id | obj | diff | description 模板 | setup 注入 | 判定 | AnswerSheet | side effect 检查 | 预期改 state | 不应改 state |
|---|---|---|---|---|---|---|---|---|---|
| cmcc.check_balance | query | L1 | 查看话费余额 | 无 | answer user.balance | 是(number) | 无 | 无 | activePlan |
| cmcc.check_data | query | L1 | 查看剩余流量 | 无 | answer user.dataUsage | 是(number) | 无 | 无 | activePlan |
| cmcc.check_points | query | L1 | 查看我的积分 | 无 | answer user.points | 是(number) | 无 | 无 | activePlan |
| cmcc.check_plan | query | L1 | 查看当前套餐 | 无 | answer activePlan.name | 是(text) | 无 | 无 | user.balance |
| cmcc.toggle_data_alert | operate | L1 | {toggle}流量预警 | 翻转 | criteria settings.dataAlert | 否 | criteria 派生 | settings.dataAlert | activePlan |
| cmcc.recharge | operate | L2 | 充值{amount}元话费 | amount 采样 | custom diff user.balance(参考 Alipay deductBalance) | 否 | user.balance[+=val] | user.balance | activePlan |
| cmcc.buy_data_pack | operate | L3 | 办理{pack}流量包 | pack 采样 | custom diff user.dataUsage/orders | 否 | orders[+1]/user.dataUsage[+=val] | orders/user.dataUsage | user.balance |
| cmcc.check_bill_total | query | L2 | 查看本月账单总额 | 无 | answer bills[month].total | 是(number) | 无 | 无 | activePlan |
| cmcc.multi_setting | operate | L2 | 同时关营销推送和开深色 | 翻转 | criteria 2 项(参考 Map ModifyMultiSettings) | 否 | 2 criteria | settings.* | activePlan |
| cmcc.set_data_threshold | operate | L2 | 把流量预警阈值设为{N} | N 采样 翻转 | criteria settings.dataThreshold | 否 | criteria 派生 | settings.dataThreshold | activePlan |
| cmcc.redeem_recharge_card | operate | L3 | 兑换充值卡{code} | code 采样 | custom diff balance/rechargeCards(参考 Alipay redeemRechargeCard) | 否 | user.balance[+=val]/rechargeCards | user.balance/rechargeCards | activePlan |
| cmcc.compare_data_plans | query | L3 | {planA}和{planB}哪个流量多 | 两 plan 采样 | answer choice | 是(choice) | 无 | 无 | activePlan |
| cmcc.find_cheapest_pack | query | L4 | 找最便宜的流量包 | 无 | answer 返 pack 名+价(参考 Ebay FindCheapestProduct) | 是(text+number) | 无 | 无 | activePlan |
| cmcc.change_plan | operate | L3 | 把套餐改为{plan} | plan 采样 翻转 | criteria activePlan.id | 否 | activePlan | activePlan | user.balance |
| cmcc.check_bill_items | query | L2 | 查看本月账单有几项 | 无 | answer count bill items | 是(number) | 无 | 无 | activePlan |

## 6. Cainiao

| task_id | obj | diff | description 模板 | setup 注入 | 判定 | AnswerSheet | side effect 检查 | 预期改 state | 不应改 state |
|---|---|---|---|---|---|---|---|---|---|
| cainiao.check_package_status | query | L1 | 查看{pkg}到哪了 | pkg 采样 | answer packages[id].status | 是(text) | 无 | 无 | packages[]内容 |
| cainiao.check_pickup_code | query | L1 | 查看{pkg}取件码 | pkg 采样 | answer packages[id].pickupCode | 是(text) | 无 | 无 | packages |
| cainiao.count_packages | query | L1 | 查看我有几个包裹 | 无 | answer count packages | 是(number) | 无 | 无 | packages |
| cainiao.check_carrier | query | L1 | 查看{pkg}是哪家快递 | pkg 采样 | answer carrier | 是(text) | 无 | 无 | packages |
| cainiao.search_package | query | L2 | 搜索{keyword}包裹 | keyword 采样 | custom check_searched+answer(参考 Railway) | 是(text trackingNo) | searchHistory | searchHistory | packages |
| cainiao.check_station | query | L2 | 查看{pkg}在哪个驿站 | pkg 采样 | answer station name | 是(text) | 无 | 无 | packages |
| cainiao.send_package | operate | L3 | 寄件到{address} | address 采样 | custom check new package[+1] | 否 | packages[+1] | packages | defaultAddress |
| cainiao.toggle_pickup_alert | operate | L1 | {toggle}取件提醒 | 翻转 | criteria settings.pickupAlert | 否 | criteria 派生 | settings.pickupAlert | packages |
| cainiao.check_eta | query | L2 | 查看{pkg}预计何时到 | pkg 采样 | answer eta(参考 Weather date matcher) | 是(date) | 无 | 无 | packages |
| cainiao.compare_status | query | L3 | {pkgA}和{pkgB}哪个先到 | 两 pkg 采样 | answer choice | 是(choice) | 无 | 无 | packages |
| cainiao.track_events | query | L2 | 查看{pkg}物流经过几站 | pkg 采样 | answer count events | 是(number) | 无 | 无 | packages |
| cainiao.set_default_address | operate | L2 | 把{address}设为默认 | addr 采样 翻转 | criteria defaultAddress.id | 否 | criteria 派生 | defaultAddress | packages |
| cainiao.find_oldest_package | query | L3 | 找最早的包裹 | 无 | answer 返 trackingNo | 是(text) | 无 | 无 | packages |
| cainiao.conditional_alert | hybrid | L4 | 如果{pkg}已到站就开提醒否则关 | pkg 采样 | custom 条件判 settings.pickupAlert(参考 Weather ConditionalAction) | 否 | settings.pickupAlert | settings.pickupAlert | packages |
| cainiao.check_recipient | query | L1 | 查看{pkg}收件人 | pkg 采样 | answer recipient | 是(text) | 无 | 无 | packages |

## 7. Gmail

| task_id | obj | diff | description 模板 | setup 注入 | 判定 | AnswerSheet | side effect 检查 | 预期改 state | 不应改 state |
|---|---|---|---|---|---|---|---|---|---|
| gmail.check_unread | query | L1 | 查看未读邮件数 | 无 | answer count unread threads | 是(number) | 无 | 无 | threads |
| gmail.check_thread_count | query | L1 | 查看收件箱邮件数 | 无 | answer count threads | 是(number) | 无 | 无 | threads |
| gmail.check_last_sender | query | L1 | 查看{thread}最后谁发的 | thread 采样 | answer lastSender | 是(text) | 无 | 无 | threads |
| gmail.star_thread | operate | L2 | 给{thread}加星标 | thread 采样 翻转 | criteria threads[id].starred | 否 | starredThreadIds[+=id] | starredThreadIds | threads[]内容 |
| gmail.archive_thread | operate | L2 | 归档{thread} | thread 采样 翻转 | criteria threads[id].archived | 否 | threads[id].archived | threads[id].archived | starredThreadIds |
| gmail.label_thread | operate | L2 | 给{thread}打{label}标签 | 采样 翻转 | criteria threads[id].labels[+=label] | 否 | threads[id].labels | threads[id].labels | starredThreadIds |
| gmail.send_email | operate | L2 | 给{contact}发邮件：{subject} | 采样 | custom id-diff threads messages(参考 Wechat new_sent_texts_to) | 否 | threads[contact][+=1]/drafts | threads/drafts | starredThreadIds |
| gmail.search_email | query | L2 | 搜索{keyword}邮件 | keyword 采样 | custom check_searched+answer | 是(text 主题) | searchHistory | searchHistory | threads |
| gmail.conditional_reply | hybrid | L3 | 如果Boss问过{keyword}就回{yes}否则回{no} | 采样 | custom id-diff(参考 Wechat ConditionalReplyToBoss) | 否 | threads[name=Boss][+=1] | threads | starredThreadIds |
| gmail.filter_by_label | query | L2 | 查看{label}标签下几封 | label 采样 | answer count | 是(number) | 无 | 无 | threads |
| gmail.mark_read | operate | L1 | 把{thread}标为已读 | thread 采样 翻转 | criteria threads[id].unread=False | 否 | threads[id].unread | threads[id].unread | starredThreadIds |
| gmail.compare_unread | query | L3 | {labelA}和{labelB}哪边未读多 | 两 label 采样 | answer choice | 是(choice) | 无 | 无 | threads |
| gmail.forward_email | operate | L3 | 把{thread}转发给{contact} | 采样 | custom id-diff new sent(参考 Wechat transfer) | 否 | threads[contact][+=1] | threads | starredThreadIds |
| gmail.toggle_inbox_type | operate | L1 | 切换收件箱为{type} | type 翻转 | criteria settings.inboxType | 否 | criteria 派生 | settings.inboxType | threads |
| gmail.find_oldest_thread | query | L3 | 找最早的邮件 | 无 | answer 返主题 | 是(text) | 无 | 无 | threads |

## 8. Telegram

| task_id | obj | diff | description 模板 | setup 注入 | 判定 | AnswerSheet | side effect 检查 | 预期改 state | 不应改 state |
|---|---|---|---|---|---|---|---|---|---|
| tg.check_unread | query | L1 | 查看未读消息数 | 无 | answer count unread chats | 是(number) | 无 | 无 | chats |
| tg.check_chat_count | query | L1 | 查看会话数 | 无 | answer count chats | 是(number) | 无 | 无 | chats |
| tg.send_message | operate | L2 | 给{contact}发：{text} | 采样 | custom id-diff(参考 Wechat new_sent_texts_to) | 否 | chats[contact][+=1] | chats | contacts |
| tg.forward_message | operate | L2 | 把{msg}转发给{contact} | 采样 | custom id-diff(参考 Wechat transfer) | 否 | chats[contact][+=1] | chats | contacts |
| tg.block_contact | operate | L2 | 屏蔽{contact} | contact 采样 翻转 | criteria contacts[name].isBlacklisted(参考 Wechat BlacklistContact) | 否 | contacts[id].isBlacklisted | contacts | chats |
| tg.mute_chat | operate | L2 | 静音{chat} | chat 采样 翻转 | criteria chats[id].muted | 否 | chats[id].muted | chats[id].muted | contacts |
| tg.conditional_reply | hybrid | L3 | 如果Boss问过{keyword}就回{yes}否则回{no} | 采样 | custom id-diff(参考 Wechat ConditionalReplyToBoss) | 否 | chats[name=Boss][+=1] | chats | contacts |
| tg.check_contact_info | query | L1 | 查看{contact}的资料 | contact 采样 | answer field(参考 Wechat ReadMyWxid) | 是(text) | 无 | 无 | contacts |
| tg.search_message | query | L2 | 搜索{keyword}消息 | keyword 采样 | custom check_searched+answer | 是(text) | searchHistory | searchHistory | chats |
| tg.compare_unread | query | L3 | {chatA}和{chatB}谁未读多 | 两 chat 采样 | answer choice | 是(choice) | 无 | 无 | chats |
| tg.pin_chat | operate | L2 | 置顶{chat} | chat 采样 翻转 | criteria chats[id].pinned | 否 | chats[id].pinned | chats[id].pinned | contacts |
| tg.channel_post | operate | L3 | 在频道{channel}发布：{text} | 采样 | custom id-diff channel messages(参考 Wechat PostMomentFromChat) | 否 | chats[channel][+=1] | chats | contacts |
| tg.toggle_notification | operate | L1 | {toggle}消息通知 | 翻转 | criteria settings.notification | 否 | criteria 派生 | settings.notification | chats |
| tg.star_and_mute | operate | L4 | 给{contact}加星且静音 | contact 采样 翻转 | criteria 2 项(参考 Wechat StarAndRestrictFriend) | 否 | 2 criteria | contacts[id].* | chats |
| tg.check_last_message | query | L2 | 查看{chat}最后一条消息 | chat 采样 | answer lastMessage content | 是(text) | 无 | 无 | chats |

## 9. Didi

| task_id | obj | diff | description 模板 | setup 注入 | 判定 | AnswerSheet | side effect 检查 | 预期改 state | 不应改 state |
|---|---|---|---|---|---|---|---|---|---|
| didi.check_recent_trip | query | L1 | 查看最近一次行程 | 无 | answer trips[0].dest | 是(text) | 无 | 无 | trips |
| didi.check_fare | query | L1 | 查看{trip}花了多少钱 | trip 采样 | answer trips[id].fare | 是(number) | 无 | 无 | trips |
| didi.count_trips | query | L1 | 查看我有几次行程 | 无 | answer count trips | 是(number) | 无 | 无 | trips |
| didi.estimate_route | query | L2 | 从{from}到{to}大概多少钱 | from/to 采样 | custom answer 估价(参考 Map EstimateDrivingCost) | 是(number) | searchHistory | searchHistory | trips |
| didi.place_order | operate | L3 | 叫一辆{type}从{from}到{to} | 采样 | custom check_booking_order(参考 Railway BuyTicketForPassenger) | 否 | trips[+1]/searchForm | trips/searchHistory | coupons |
| didi.select_service | operate | L2 | 选{type}车型 | type 采样 翻转 | criteria currentTrip.serviceType | 否 | criteria 派生 | currentTrip.serviceType | trips |
| didi.check_driver | query | L2 | 查看{trip}的司机信息 | trip 采样 | answer driver name/rating | 是(text) | 无 | 无 | trips |
| didi.use_coupon | operate | L3 | 下单用{coupon} | coupon 采样 | custom diff fare/coupons | 否 | trips[].fare/coupons[-=id] | trips/coupons | paymentMethods |
| didi.conditional_order | hybrid | L4 | 如果快车估价超{N}就叫专车 | N 采样 | custom 条件判 currentTrip.serviceType(参考 Weather ConditionalAction) | 否 | currentTrip.serviceType/trips | currentTrip | coupons |
| didi.compare_fares | query | L3 | {tripA}和{tripB}哪个贵 | 两 trip 采样 | answer choice | 是(choice) | 无 | 无 | trips |
| didi.trip_history | query | L2 | 查看本周几次行程 | 无 | answer count by week | 是(number) | 无 | 无 | trips |
| didi.toggle_reminder | operate | L1 | {toggle}行程提醒 | 翻转 | criteria settings.tripReminder | 否 | criteria 派生 | settings.tripReminder | trips |
| didi.add_payment | operate | L2 | 添加{method}支付方式 | method 采样 | custom diff paymentMethods | 否 | paymentMethods[+1] | paymentMethods | trips |
| didi.find_cheapest_type | query | L3 | {from}-{to}最便宜是哪种车型 | 采样 | answer type+fare(参考 Ebay FindCheapestProduct) | 是(text+number) | searchHistory | searchHistory | trips |
| didi.set_home_address | operate | L2 | 把{address}设为家 | addr 采样 翻转 | criteria recentPlaces.home.id | 否 | criteria 派生 | recentPlaces.home | trips |

## 10. Amazon

| task_id | obj | diff | description 模板 | setup 注入 | 判定 | AnswerSheet | side effect 检查 | 预期改 state | 不应改 state |
|---|---|---|---|---|---|---|---|---|---|
| amazon.count_cart | query | L1 | 查看购物车几件 | 无 | answer count cart | 是(number) | 无 | 无 | cart |
| amazon.check_price | query | L1 | 查看{product}多少钱 | product 采样 | answer products[id].price | 是(number) | 无 | 无 | cart |
| amazon.check_rating | query | L1 | 查看{product}评分 | product 采样 | answer rating | 是(number) | 无 | 无 | cart |
| amazon.search_product | query | L2 | 搜索{keyword}商品 | keyword 采样 | custom check_has_snapshot+answer(参考 Ebay) | 是(text 标题) | search.current/history/lastCompare | searchHistory | cart |
| amazon.sort_results | operate | L2 | 搜索结果按{sort}排 | sort 翻转 | criteria search.current.sortOption | 否 | search.* | searchHistory | cart |
| amazon.filter_by_brand | query | L2 | 查看品牌{brand}商品数 | brand 采样 | custom check_has_snapshot+answer count(参考 Ebay) | 是(number) | search.* | searchHistory | cart |
| amazon.add_to_cart | operate | L2 | 把{product}加入购物车 | product 采样 | custom diff cart[+1] | 否 | cart[+1] | cart | orders |
| amazon.find_cheapest | query | L4 | 找最便宜的商品 | 无 | answer title+price(参考 Ebay FindCheapestProduct) | 是(text+number) | search.* | searchHistory | cart |
| amazon.compare_prices | query | L3 | {pA}和{pB}哪个便宜 | 两 product 采样 | answer choice(参考 Ebay) | 是(choice) | search.* | searchHistory | cart |
| amazon.place_order | operate | L3 | 下单{product} | product 采样 | custom diff orders[+1](参考 Railway) | 否 | orders[+1]/cart[-=id] | orders/cart | searchHistory |
| amazon.check_order_status | query | L1 | 查看最近订单状态 | 无 | answer orders[0].status | 是(text) | 无 | 无 | orders[]内容 |
| amazon.wishlist | operate | L2 | 收藏{product} | product 采样 翻转 | custom diff savedItems | 否 | savedItems[+=id] | savedItems | cart |
| amazon.compare_group_counts | query | L3 | {catA}和{catB}哪边商品多 | 两 cat 采样 | answer choice+counts(参考 Ebay CompareTwoGroupCounts) | 是(choice+2 number) | search.* | searchHistory | cart |
| amazon.toggle_theme | operate | L1 | 切换深色模式 | 翻转 | criteria settings.themeId | 否 | criteria 派生 | settings.themeId | cart |
| amazon.count_in_range | query | L3 | 价格{min}-{max}的商品数 | 范围采样 | custom check_has_snapshot+answer count | 是(number) | search.* | searchHistory | cart |

---

## 难度与判定分布速查

| App | L1 | L2 | L3 | L4 | 主判定范式 | 主要参考 |
|---|---|---|---|---|---|---|
| Wallet | 6 | 6 | 3 | 0 | criteria+answer | Alipay bankCards |
| Duolingo | 5 | 6 | 3 | 1 | answer+custom | Spotify/Weather |
| GoogleDrive | 4 | 6 | 3 | 2 | custom(快照)+answer | Ebay |
| Zhihu | 4 | 6 | 4 | 1 | custom(id-diff)+answer | Spotify/Wechat |
| ChinaMobile | 6 | 5 | 3 | 1 | criteria+custom | Alipay/Railway/Weather |
| Cainiao | 6 | 5 | 2 | 2 | custom+answer | Railway/Map/Weather |
| Gmail | 5 | 5 | 4 | 1 | id-diff+criteria | Wechat |
| Telegram | 5 | 5 | 3 | 2 | id-diff+criteria | Wechat |
| Didi | 5 | 5 | 3 | 2 | custom(全链路)+answer | Map/Railway |
| Amazon | 5 | 5 | 3 | 2 | custom(快照)+answer | Ebay |

共性：query 任务用 `answer`+AnswerSheet（number/text/choice/date），operate 任务用 `criteria` 或 `custom` id-diff；hybrid 用条件分支判（参考 Weather `ConditionalAction`）；`expected_changes` 恒声明预期改 state 路径，标"不应改"列为副作用守卫。
