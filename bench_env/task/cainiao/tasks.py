"""
Cainiao (菜鸟) task definitions.

15 tasks covering the DAILY_APP_15 Cainiao matrix:
  - query (10): check_package_status, check_pickup_code, count_packages,
    check_carrier, search_package, check_station, check_eta, compare_status,
    track_events, find_oldest_package, check_recipient
  - operate (4): send_package, toggle_pickup_alert, set_default_address
  - hybrid (1): conditional_alert

All judging is deterministic code (no VLM): AnswerTask grounded answer-sheet
matching for query tasks, CriteriaTask for toggle/operate tasks, and custom
check_goals for tasks needing composite checks. No task relies on real
wall-clock time or randomness for its ground truth.
"""
# -- Task Index (auto-generated, do not edit) --
# 15 tasks
#
# [L1] CheckPackageStatus    打开菜鸟，查看运单号为{pkg}的包裹到哪了，然后在答题卡里填写当前物流状态。
# [L1] CheckPickupCode       打开菜鸟，在待取件列表里找到收件人为{recipientName}的包裹，查看它的取件码，然后在答题卡里填写取件码。
# [L1] CountPackages         打开菜鸟，查看我一共有几个包裹，然后在答题卡里填写包裹数量。
# [L1] CheckCarrier          打开菜鸟，查看运单号为{pkg}的包裹是哪家快递，然后在答题卡里填写快递公司。
# [L2] SearchPackage         打开菜鸟，搜索运单号{tracking_no}的包裹，打开该包裹查看取件码，然后在答题卡里填写该包裹的取件码。
# [L2] CheckStation          打开菜鸟，查看运单号为{pkg}的包裹在哪个驿站，然后在答题卡里填写驿站名称。
# [L3] SendPackage           打开菜鸟，寄一个快递，收件人姓名填{recipientName}，电话填{recipientPhone}，收件地址填{recipientAddress}，提交订单（不要修改默认寄件地址）。
# [L1] TogglePickupAlert     打开菜鸟，把取件提醒{enable}。
# [L2] CheckEta              打开菜鸟，查看运单号为{pkg}的包裹预计哪天送达，然后在答题卡里填写预计送达日期。
# [L3] CompareStatus         打开菜鸟，查看运单号{pkgA}和{pkgB}的包裹哪个预计先到，然后在答题卡里选择先到的运单号。
# [L2] TrackEvents           打开菜鸟，查看运单号为{pkg}的包裹物流经过了几站，然后在答题卡里填写物流节点数量。
# [L2] SetDefaultAddress     打开菜鸟，把地址簿里收件人为{recipientName}的地址设为默认地址。
# [L3] FindOldestPackage     打开菜鸟，找出最早寄出的包裹，然后在答题卡里填写它的运单号。
# [L4] ConditionalAlert      打开菜鸟，如果运单号为{pkg}的包裹已到驿站就把取件提醒打开，否则把取件提醒关掉。
# [L1] CheckRecipient        打开菜鸟，查看运单号为{pkg}的包裹收件人是谁，然后在答题卡里填写收件人姓名。
# -- End Task Index --

from __future__ import annotations

from typing import Any

from bench_env.task.base import BaseTask
from bench_env.task.common_tasks import AnswerTask, CriteriaTask
from bench_env.task.judge import JudgeInput
from bench_env.task.cainiao.app import Cainiao


# =============================================================================
# Query tasks (AnswerTask — grounded answer-sheet, no custom check_goals)
# =============================================================================

class CheckPackageStatus(AnswerTask):
    """查看指定包裹的当前物流状态。"""

    templates = [
        "打开菜鸟，查看运单号为{pkg}的包裹到哪了，然后在答题卡里填写当前物流状态。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L1"
    max_steps = 30
    capabilities = ["nav", "extract"]

    parameters = {
        "pkgId": {"type": "string", "default": "pkg-002"},
        "pkg": {"type": "string", "default": "ZT9876543210987"},
        "_pkg": {
            "sampler": Cainiao.sample_package,
            "fields": {"pkgId": "pkgId", "pkg": "pkg"},
        },
    }
    answer = ".packages[id={pkgId}].statusLabel"
    answer_fields = [{"type": "text", "label": "当前物流状态", "hint": "如：运输中"}]


class CheckPickupCode(AnswerTask):
    """在待取件列表中按收件人定位包裹并填写取件码。

    与 SearchPackage 区分：本题不提供运单号、不走搜索入口，而是从首页
    「待取件」筛选列表按收件人姓名找到目标包裹，打开详情后填写取件码。
    答案（取件码）不出现在题目里，需打开正确包裹详情才能获得。
    """

    templates = [
        "打开菜鸟，在待取件列表里找到收件人为{recipientName}的包裹，"
        "查看它的取件码，然后在答题卡里填写取件码。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L1"
    max_steps = 30
    capabilities = ["nav", "extract"]

    parameters = {
        "pkgId": {"type": "string", "default": "pkg-002"},
        "pkg": {"type": "string", "default": "ZT9876543210987"},
        "recipientName": {"type": "string", "default": "李强"},
        "_pkg": {
            "sampler": Cainiao.sample_package_with_pickup,
            "fields": {"pkgId": "pkgId", "pkg": "pkg", "recipientName": "recipientName"},
        },
    }
    answer = ".packages[id={pkgId}].pickupCode"
    answer_fields = [{"type": "text", "label": "取件码", "hint": "如：8-2-4567"}]


class CountPackages(AnswerTask):
    """查看包裹总数。"""

    templates = [
        "打开菜鸟，查看我一共有几个包裹，然后在答题卡里填写包裹数量。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L1"
    max_steps = 30
    capabilities = ["extract"]

    answer = (".packages", len)
    answer_fields = [{"type": "number", "label": "包裹数量"}]


class CheckCarrier(AnswerTask):
    """查看指定包裹的快递公司。"""

    templates = [
        "打开菜鸟，查看运单号为{pkg}的包裹是哪家快递，然后在答题卡里填写快递公司。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L1"
    max_steps = 30
    capabilities = ["nav", "extract"]

    parameters = {
        "pkgId": {"type": "string", "default": "pkg-002"},
        "pkg": {"type": "string", "default": "ZT9876543210987"},
        "_pkg": {
            "sampler": Cainiao.sample_package,
            "fields": {"pkgId": "pkgId", "pkg": "pkg"},
        },
    }
    answer = ".packages[id={pkgId}].carrierName"
    answer_fields = [{"type": "text", "label": "快递公司", "hint": "如：顺丰速运"}]


class CheckStation(AnswerTask):
    """查看指定包裹所在驿站名称。"""

    templates = [
        "打开菜鸟，查看运单号为{pkg}的包裹在哪个驿站，然后在答题卡里填写驿站名称。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 30
    capabilities = ["nav", "extract"]

    parameters = {
        "pkgId": {"type": "string", "default": "pkg-002"},
        "pkg": {"type": "string", "default": "ZT9876543210987"},
        "_pkg": {
            "sampler": Cainiao.sample_package_with_station,
            "fields": {"pkgId": "pkgId", "pkg": "pkg"},
        },
    }
    answer = ".packages[id={pkgId}].station.name"
    answer_fields = [{"type": "text", "label": "驿站名称", "hint": "如：菜鸟驿站·阳光小区店"}]


class CheckEta(AnswerTask):
    """查看指定包裹预计送达日期（date matcher）。"""

    templates = [
        "打开菜鸟，查看运单号为{pkg}的包裹预计哪天送达，然后在答题卡里填写预计送达日期。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 30
    capabilities = ["nav", "extract"]

    parameters = {
        "pkgId": {"type": "string", "default": "pkg-002"},
        "pkg": {"type": "string", "default": "ZT9876543210987"},
        "_pkg": {
            "sampler": Cainiao.sample_package_with_eta,
            "fields": {"pkgId": "pkgId", "pkg": "pkg"},
        },
    }
    answer = ".packages[id={pkgId}].eta"
    answer_fields = [{"type": "text", "label": "预计送达日期", "matcher": "date"}]


class CompareStatus(AnswerTask):
    """比较两个包裹哪个预计先到（choice answer）。"""

    templates = [
        "打开菜鸟，查看运单号{pkgA}和{pkgB}的包裹哪个预计先到，"
        "然后在答题卡里选择先到的运单号。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L3"
    max_steps = 45
    capabilities = ["nav", "extract", "reasoning"]

    parameters = {
        "pkgA": {"type": "string", "default": "ZT9876543210987"},
        "pkgB": {"type": "string", "default": "SF1234567890123"},
        "pkgAId": {"type": "string", "default": "pkg-002"},
        "pkgBId": {"type": "string", "default": "pkg-001"},
        "_pair": {
            "sampler": Cainiao.sample_two_packages_with_eta,
            "fields": {
                "pkgA": "pkgA", "pkgB": "pkgB",
                "pkgAId": "pkgAId", "pkgBId": "pkgBId",
            },
        },
    }
    answer_fields = [
        {"type": "choice", "label": "先到的运单号", "options": ["{pkgA}", "{pkgB}"]}
    ]

    def get_answer(self, input: JudgeInput) -> Any:
        return Cainiao.earlier_arrival_tracking_no(
            input.apps_init, self.p.pkgAId, self.p.pkgBId
        )


class TrackEvents(AnswerTask):
    """查看指定包裹物流经过的节点数量。"""

    templates = [
        "打开菜鸟，查看运单号为{pkg}的包裹物流经过了几站，"
        "然后在答题卡里填写物流节点数量。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 30
    capabilities = ["nav", "extract"]

    parameters = {
        "pkgId": {"type": "string", "default": "pkg-002"},
        "pkg": {"type": "string", "default": "ZT9876543210987"},
        "_pkg": {
            "sampler": Cainiao.sample_package,
            "fields": {"pkgId": "pkgId", "pkg": "pkg"},
        },
    }
    answer = (".packages[id={pkgId}].events", len)
    answer_fields = [{"type": "number", "label": "物流节点数量"}]


class FindOldestPackage(AnswerTask):
    """找出最早寄出的包裹（推理：比较各包裹最早物流节点时间）。"""

    templates = [
        "打开菜鸟，找出最早寄出的包裹，然后在答题卡里填写它的运单号。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L3"
    max_steps = 45
    capabilities = ["nav", "extract", "reasoning"]

    answer_fields = [{"type": "text", "label": "最早包裹的运单号", "hint": "如：STO7788990011223"}]

    def get_answer(self, input: JudgeInput) -> Any:
        return Cainiao.oldest_package_tracking_no(input.apps_init)


class CheckRecipient(AnswerTask):
    """查看指定包裹的收件人姓名。"""

    templates = [
        "打开菜鸟，查看运单号为{pkg}的包裹收件人是谁，然后在答题卡里填写收件人姓名。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L1"
    max_steps = 30
    capabilities = ["nav", "extract"]

    parameters = {
        "pkgId": {"type": "string", "default": "pkg-002"},
        "pkg": {"type": "string", "default": "ZT9876543210987"},
        "_pkg": {
            "sampler": Cainiao.sample_package,
            "fields": {"pkgId": "pkgId", "pkg": "pkg"},
        },
    }
    answer = ".packages[id={pkgId}].recipient.name"
    answer_fields = [{"type": "text", "label": "收件人姓名", "hint": "如：李强"}]


# =============================================================================
# Query task with side-effect: search (custom check_goals)
# =============================================================================

class SearchPackage(BaseTask):
    """搜索指定运单号的包裹并填写其取件码（grounded query）。

    setup 注入一个带唯一 tracking_no 与唯一 pickup_code 的待取件包裹
    （不在静态 defaults 内），使取件码只能通过「搜索运单号 → 打开包裹详情」
    获得，无法从题目或默认数据猜出。判定同时校验：是否执行了搜索、搜索的
    运单号与结果包裹是否正确、是否打开了正确包裹详情、答题卡是否提交、
    取件码是否正确，并确保不产生预期外副作用（packages / sendRecords /
    addresses / notifications / user 均不变）。

    与 CheckPickupCode 区分：本题提供运单号、必须使用搜索入口定位；而
    CheckPickupCode 不提供运单号、按收件人在待取件列表定位。
    """

    templates = [
        "打开菜鸟，搜索运单号{tracking_no}的包裹，打开该包裹查看取件码，"
        "然后在答题卡里填写该包裹的取件码。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 35
    capabilities = ["nav", "search", "extract"]

    parameters = {
        "tracking_no": {"type": "string", "default": "SF0000000000001"},
        "pickupCode": {"type": "string", "default": "1-1-0001"},
        "pkgId": {"type": "string", "default": "pkg-search-target"},
        "_target": {
            "sampler": Cainiao.sample_search_target,
            "fields": {
                "tracking_no": "trackingNo",
                "pickupCode": "pickupCode",
                "pkgId": "pkgId",
            },
        },
    }
    # 搜索会写入 search.current / search.history；浏览态（_temp.lastViewedPackageId）
    # 与答题卡（apps.answer_sheet）均属 always_ignore，不计副作用。
    # packages 必须不变（注入的目标包裹在 apps_init 内，不产生 diff）。
    expected_changes = ["search.current", "search.history"]
    answer_fields = [{"type": "text", "label": "取件码", "hint": "如：8-2-4567"}]

    async def _post_sample(self, env: Any) -> None:
        # 注入唯一目标包裹（arrived_station + 唯一取件码），不在静态 defaults 内。
        pkg = Cainiao.build_search_target_package(
            str(self.p.tracking_no), str(self.p.pickupCode), str(self.p.pkgId)
        )
        await env.set_state(
            {"apps": {"cainiao": {"packages[]": [pkg]}}},
            deep=True,
            reload=False,
        )

    def get_expected_response(self, input: JudgeInput) -> list:
        return [str(self.p.pickupCode)]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        cn = Cainiao(
            input.apps.get("cainiao") or {},
            init=input.apps_init.get("cainiao") or {},
        )
        current = cn.search_current
        target_tracking = str(self.p.tracking_no)
        target_pkg_id = str(self.p.pkgId)
        target_pickup = str(self.p.pickupCode)

        searched = bool(current.get("searched"))
        searched_tracking = str(current.get("trackingNo") or "")
        result_pkg_id = str(current.get("resultPackageId") or "")
        viewed_id = cn.viewed_package_id

        sheet = input.apps.get("answer_sheet") or {}
        submitted = bool(sheet.get("submitted"))
        answers = sheet.get("answers") or {}
        answer_text = str(answers.get("0") or "").strip()

        return [
            {
                "field": "search.performed",
                "expected": True,
                "actual": searched,
                "passed": searched,
            },
            {
                "field": "search.tracking_no",
                "expected": target_tracking,
                "actual": searched_tracking,
                "passed": searched and searched_tracking == target_tracking,
            },
            {
                "field": "search.result_package_id",
                "expected": target_pkg_id,
                "actual": result_pkg_id,
                "passed": searched and result_pkg_id == target_pkg_id,
            },
            {
                "field": "package.viewed",
                "expected": target_pkg_id,
                "actual": viewed_id or None,
                "passed": viewed_id == target_pkg_id,
            },
            {
                "field": "answer_sheet.submitted",
                "expected": True,
                "actual": submitted,
                "passed": submitted is True,
            },
            {
                "field": "answer.pickup_code",
                "expected": target_pickup,
                "actual": answer_text,
                "passed": bool(answer_text) and answer_text == target_pickup,
            },
        ]


# =============================================================================
# Operate tasks (CriteriaTask / custom check_goals)
# =============================================================================

class TogglePickupAlert(CriteriaTask):
    """开启/关闭取件提醒（参数化 toggle，初始态自动翻转）。"""

    templates = ["打开菜鸟，把取件提醒{enable}。"]
    apps = ["cainiao"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L1"
    max_steps = 30
    capabilities = ["settings"]

    parameters = {
        "enable": {
            "type": "bool",
            "values": {"开启": True, "关闭": False},
            "default": True,
        },
    }
    criteria = {"settings.pickupAlert": "{enable}"}

    async def _post_sample(self, env: Any) -> None:
        await self._invert_criteria(env)


class SetDefaultAddress(CriteriaTask):
    """把地址簿里指定地址设为默认地址。

    初始默认地址被显式设为「非目标地址」，确保任务总是需要一次切换。
    切换默认地址会修改 ``defaultAddressId`` 与各地址的 ``isDefault`` 标志
    （均属预期副作用），``packages`` 不应变化。
    """

    templates = [
        "打开菜鸟，把地址簿里收件人为{recipientName}的地址设为默认地址。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 30
    capabilities = ["nav", "operate"]

    parameters = {
        "addressId": {"type": "string", "default": "addr-003"},
        "recipientName": {"type": "string", "default": "王芳"},
        "_addr": {
            "sampler": Cainiao.sample_address,
            "fields": {"addressId": "addressId", "recipientName": "recipientName"},
        },
    }
    criteria = {
        "defaultAddressId": "{addressId}",
        "addresses[id={addressId}].isDefault": True,
    }
    # defaultAddressId 由 criteria 派生；addresses 的 isDefault 标志变化也属预期。
    expected_changes = ["addresses"]

    async def _post_sample(self, env: Any) -> None:
        # Ensure the initial default is a different (non-target) address,
        # and isDefault flags are consistent with it.
        from bench_env.task.cainiao.app import CAINIAO_ADDRESSES

        target_id = str(self.p.addressId)
        initial_default = next(
            (a["id"] for a in CAINIAO_ADDRESSES if a.get("id") != target_id),
            None,
        )
        if initial_default is None:
            return
        patched = [
            {**a, "isDefault": a.get("id") == initial_default}
            for a in CAINIAO_ADDRESSES
        ]
        await env.set_state(
            {
                "apps": {
                    "cainiao": {
                        "defaultAddressId": initial_default,
                        "addresses": patched,
                    }
                }
            },
            deep=True,
            reload=False,
        )


class SendPackage(BaseTask):
    """寄一个快递到指定收件地址（创建一条寄件记录）。

    判定：新增一条 sendRecord，其收件人姓名/电话/地址与采样地址一致；
    defaultAddressId 不应被修改。寄快递功能上创建 sendRecord（寄件订单），
    因此预期副作用为 ``sendRecords``，而非 ``packages``（详见验证报告）。
    """

    templates = [
        "打开菜鸟，寄一个快递，收件人姓名填{recipientName}，"
        "电话填{recipientPhone}，收件地址填{recipientAddress}，"
        "提交订单（不要修改默认寄件地址）。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    max_steps = 45
    capabilities = ["nav", "operate", "form"]

    parameters = {
        "addressId": {"type": "string", "default": "addr-003"},
        "recipientName": {"type": "string", "default": "王芳"},
        "recipientPhone": {"type": "string", "default": "139****0001"},
        "recipientAddress": {
            "type": "string",
            "default": "广东省深圳市南山区阳光小区3栋1号",
        },
        "_addr": {
            "sampler": Cainiao.sample_address,
            "fields": {
                "addressId": "addressId",
                "recipientName": "recipientName",
                "recipientPhone": "recipientPhone",
                "recipientAddress": "recipientAddress",
            },
        },
    }
    expected_changes = ["sendRecords"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        cn = Cainiao(
            input.apps.get("cainiao") or {},
            init=input.apps_init.get("cainiao") or {},
        )
        init_ids = [str(r.get("id") or "") for r in cn.init.send_records]
        new_records = [
            r for r in cn.send_records
            if str(r.get("id") or "") not in init_ids
        ]
        new_record = new_records[0] if new_records else None

        target_name = str(self.p.recipientName)
        target_phone = str(self.p.recipientPhone)
        target_address = str(self.p.recipientAddress)

        receiver = (new_record or {}).get("receiver") or {}
        name_ok = str(receiver.get("name") or "") == target_name
        phone_ok = str(receiver.get("phone") or "") == target_phone
        addr_ok = str(receiver.get("address") or "") == target_address

        default_unchanged = cn.default_address_id == cn.init.default_address_id

        return [
            {
                "field": "send_records.new_count",
                "expected": 1,
                "actual": len(new_records),
                "passed": len(new_records) == 1,
            },
            {
                "field": "send_record.receiver_name",
                "expected": target_name,
                "actual": receiver.get("name"),
                "passed": name_ok,
            },
            {
                "field": "send_record.receiver_phone",
                "expected": target_phone,
                "actual": receiver.get("phone"),
                "passed": phone_ok,
            },
            {
                "field": "send_record.receiver_address",
                "expected": target_address,
                "actual": receiver.get("address"),
                "passed": addr_ok,
            },
            {
                "field": "default_address_unchanged",
                "expected": cn.init.default_address_id,
                "actual": cn.default_address_id,
                "passed": default_unchanged,
            },
        ]


# =============================================================================
# Hybrid task: conditional operate (read state → toggle setting)
# =============================================================================

class ConditionalAlert(BaseTask):
    """如果指定包裹已到驿站就打开取件提醒，否则关掉。

    目标值取决于包裹「初始」状态（已到站 → 开启；否则 → 关闭）。
    初始 settings.pickupAlert 被置为目标值的反值，确保必须切换。
    """

    templates = [
        "打开菜鸟，如果运单号为{pkg}的包裹已到驿站就把取件提醒打开，"
        "否则把取件提醒关掉。",
    ]
    apps = ["cainiao"]
    scope = "S1"
    objective = "hybrid"
    composition = "sequential"
    difficulty = "L4"
    max_steps = 60
    capabilities = ["nav", "extract", "settings", "reasoning"]

    parameters = {
        "pkgId": {"type": "string", "default": "pkg-002"},
        "pkg": {"type": "string", "default": "ZT9876543210987"},
        "_pkg": {
            "sampler": Cainiao.sample_package,
            "fields": {"pkgId": "pkgId", "pkg": "pkg"},
        },
    }
    expected_changes = ["settings.pickupAlert"]

    def _target_pickup_alert(self, input: JudgeInput) -> bool:
        cn_init = Cainiao(input.apps_init.get("cainiao") or {})
        pkg = cn_init.package_by_id(str(self.p.pkgId))
        status = str((pkg or {}).get("status") or "")
        return status == "arrived_station"

    async def _post_sample(self, env: Any) -> None:
        # Invert the goal: set pickupAlert to the opposite of the target so
        # the agent must actually toggle it. input is not available here, so
        # compute the target from the sampled package id via env state.
        state = await env.get_state(required_apps=self.apps)
        cn_init = Cainiao((state.get("apps") or {}).get("cainiao") or {})
        pkg = cn_init.package_by_id(str(self.p.pkgId))
        status = str((pkg or {}).get("status") or "")
        target = status == "arrived_station"
        await env.set_state(
            {"apps": {"cainiao": {"settings": {"pickupAlert": not target}}}},
            deep=True,
            reload=False,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        cn = Cainiao(input.apps.get("cainiao") or {})
        expected = self._target_pickup_alert(input)
        actual = bool(cn.settings.get("pickupAlert"))
        return [
            {
                "field": "settings.pickupAlert",
                "expected": expected,
                "actual": actual,
                "passed": actual == expected,
            }
        ]
