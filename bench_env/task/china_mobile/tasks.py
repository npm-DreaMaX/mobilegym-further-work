"""
China Mobile (中国移动) task definitions.

15 tasks covering the ChinaMobile matrix:
  - query (5):  CheckBalance, CheckData, CheckPlan, CheckBillTopCategory, CheckVoice
  - operate (9): RechargeFifty, PayArrears, BuyDataPack, ChangePlan, EnableRoaming,
                DisableVas, EnableAutopay, AddFamilyNumber, DeleteFamilyNumber, UpdateEmail
  - hybrid (0)

All judging is deterministic code (no VLM). Query tasks require the agent to
actually visit the right page (verified via _temp.visitedPages) and submit a
correct AnswerSheet value. Operate tasks verify real state mutations
(balance / transactions / bill status / plan / service flag / family list /
profile) — never a toast. No task instruction leaks the ground-truth answer.
No task relies on real wall-clock time or randomness for its ground truth.
"""
# -- Task Index (auto-generated, do not edit) --
# 15 tasks
#
# [L1] CheckBalance          打开中国移动，进入话费余额页面查看当前话费余额，然后在答题卡里填写余额金额。
# [L1] CheckData             打开中国移动，进入流量用量详情查看本月剩余高速流量，然后在答题卡里填写剩余流量（GB）。
# [L1] CheckPlan             打开中国移动，进入套餐详情查看当前套餐名称，然后在答题卡里填写套餐名称。
# [L2] CheckBillTopCategory  打开中国移动，打开本月账单明细，查看金额最高的费用分类，然后在答题卡里填写该分类名称。
# [L2] RechargeFifty         打开中国移动，为当前号码充值50元话费。
# [L2] PayArrears            打开中国移动，找到2026年06月的欠费账单并缴清。
# [L3] BuyDataPack           打开中国移动，在商城购买10GB流量加油包。
# [L3] ChangePlan            打开中国移动，将当前基础套餐变更为飞享套餐-58元。
# [L1] EnableRoaming         打开中国移动，开通国际漫游服务。
# [L2] DisableVas           打开中国移动，关闭已订购的增值业务“视频彩铃”。
# [L2] EnableAutopay         打开中国移动，开启自动缴费并选择招商银行储蓄卡作为缴费方式。
# [L2] AddFamilyNumber       打开中国移动，添加一个亲情号码，手机号填13900001234，昵称填儿子。
# [L2] DeleteFamilyNumber    打开中国移动，删除亲情号码爸爸（13800100001）。
# [L2] UpdateEmail           打开中国移动，将个人资料中的联系邮箱修改为zhangwei2026@163.com。
# [L1] CheckVoice            打开中国移动，进入语音用量页面查看本月剩余语音分钟数，然后在答题卡里填写剩余分钟数。
# -- End Task Index --

from __future__ import annotations

from typing import Any

from bench_env.task.base import BaseTask
from bench_env.task.common_tasks import AnswerTask, CriteriaTask, match_value
from bench_env.task.judge import JudgeInput
from bench_env.task.china_mobile.app import ChinaMobile, CHINA_MOBILE_SERVICES


def _round2(n: float) -> float:
    return round(n * 100) / 100


def _read_sheet(input: JudgeInput) -> tuple[bool, str]:
    """Return (submitted, first-field-answer-text) from the answer_sheet app."""
    sheet = input.apps.get("answer_sheet") or {}
    submitted = bool(sheet.get("submitted"))
    answers = sheet.get("answers") or {}
    answer_text = str(answers.get("0") or "").strip()
    return submitted, answer_text


# =============================================================================
# Query tasks (BaseTask — grounded answer-sheet + page-visit verification)
# =============================================================================

class CheckBalance(BaseTask):
    """查看当前话费余额（须进入余额页，再答题）。"""

    templates = [
        "打开中国移动，进入话费余额页面查看当前话费余额，然后在答题卡里填写余额金额。",
    ]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L1"
    max_steps = 30
    capabilities = ["nav", "extract"]

    answer_fields = [{"type": "number", "label": "话费余额(元)"}]

    def _expected(self, input: JudgeInput) -> float:
        return _round2(float(input.apps_init["chinamobile"]["balance"]))

    def get_expected_response(self, input: JudgeInput) -> list:
        return [str(self._expected(input))]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        cm = ChinaMobile(input.apps["chinamobile"], init=input.apps_init["chinamobile"])
        visited = "balance" in cm.visited_pages
        submitted, answer_text = _read_sheet(input)
        expected = self._expected(input)
        return [
            {"field": "page.visited", "expected": "balance", "actual": cm.visited_pages, "passed": visited},
            {"field": "answer_sheet.submitted", "expected": True, "actual": submitted, "passed": submitted is True},
            {"field": "answer.balance", "expected": expected, "actual": answer_text,
             "passed": bool(answer_text) and match_value(expected, answer_text)},
        ]


class CheckData(BaseTask):
    """查看本月剩余高速流量（须进入流量用量页，再答题）。"""

    templates = [
        "打开中国移动，进入流量用量详情查看本月剩余高速流量，然后在答题卡里填写剩余流量（GB）。",
    ]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L1"
    max_steps = 30
    capabilities = ["nav", "extract"]

    answer_fields = [{"type": "number", "label": "本月剩余高速流量(GB)"}]

    def _expected(self, input: JudgeInput) -> float:
        return ChinaMobile.remaining_data_gb(input.apps_init["chinamobile"])

    def get_expected_response(self, input: JudgeInput) -> list:
        return [str(self._expected(input))]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        cm = ChinaMobile(input.apps["chinamobile"], init=input.apps_init["chinamobile"])
        visited = "data" in cm.visited_pages
        submitted, answer_text = _read_sheet(input)
        expected = self._expected(input)
        return [
            {"field": "page.visited", "expected": "data", "actual": cm.visited_pages, "passed": visited},
            {"field": "answer_sheet.submitted", "expected": True, "actual": submitted, "passed": submitted is True},
            {"field": "answer.remaining_data", "expected": expected, "actual": answer_text,
             "passed": bool(answer_text) and match_value(expected, answer_text)},
        ]


class CheckPlan(BaseTask):
    """查看当前套餐名称（须进入套餐详情页，再答题）。"""

    templates = [
        "打开中国移动，进入套餐详情查看当前套餐名称，然后在答题卡里填写套餐名称。",
    ]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L1"
    max_steps = 30
    capabilities = ["nav", "extract"]

    answer_fields = [{"type": "text", "label": "当前套餐名称"}]

    def _expected(self, input: JudgeInput) -> str:
        return ChinaMobile.active_plan_name(input.apps_init["chinamobile"])

    def get_expected_response(self, input: JudgeInput) -> list:
        return [self._expected(input)]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        cm = ChinaMobile(input.apps["chinamobile"], init=input.apps_init["chinamobile"])
        visited = "plan" in cm.visited_pages
        submitted, answer_text = _read_sheet(input)
        expected = self._expected(input)
        return [
            {"field": "page.visited", "expected": "plan", "actual": cm.visited_pages, "passed": visited},
            {"field": "answer_sheet.submitted", "expected": True, "actual": submitted, "passed": submitted is True},
            {"field": "answer.plan_name", "expected": expected, "actual": answer_text,
             "passed": bool(answer_text) and match_value(expected, answer_text)},
        ]


class CheckBillTopCategory(BaseTask):
    """打开本月账单明细，回答金额最高的费用分类（须进入账单明细页）。"""

    templates = [
        "打开中国移动，打开本月账单明细，查看金额最高的费用分类，然后在答题卡里填写该分类名称。",
    ]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 30
    capabilities = ["nav", "extract", "reasoning"]

    answer_fields = [{"type": "text", "label": "金额最高的费用分类", "hint": "如：套餐费"}]

    def _expected(self, input: JudgeInput) -> str:
        return ChinaMobile.current_bill_top_category(input.apps_init["chinamobile"])

    def get_expected_response(self, input: JudgeInput) -> list:
        return [self._expected(input)]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        cm = ChinaMobile(input.apps["chinamobile"], init=input.apps_init["chinamobile"])
        visited = "billDetail" in cm.visited_pages
        submitted, answer_text = _read_sheet(input)
        expected = self._expected(input)
        return [
            {"field": "page.visited", "expected": "billDetail", "actual": cm.visited_pages, "passed": visited},
            {"field": "answer_sheet.submitted", "expected": True, "actual": submitted, "passed": submitted is True},
            {"field": "answer.top_category", "expected": expected, "actual": answer_text,
             "passed": bool(answer_text) and match_value(expected, answer_text)},
        ]


class CheckVoice(BaseTask):
    """查看本月剩余语音分钟数（须进入语音用量页，再答题）。"""

    templates = [
        "打开中国移动，进入语音用量页面查看本月剩余语音分钟数，然后在答题卡里填写剩余分钟数。",
    ]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L1"
    max_steps = 30
    capabilities = ["nav", "extract"]

    answer_fields = [{"type": "number", "label": "本月剩余语音分钟(分钟)"}]

    def _expected(self, input: JudgeInput) -> int:
        return ChinaMobile.remaining_voice_min(input.apps_init["chinamobile"])

    def get_expected_response(self, input: JudgeInput) -> list:
        return [str(self._expected(input))]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        cm = ChinaMobile(input.apps["chinamobile"], init=input.apps_init["chinamobile"])
        visited = "voice" in cm.visited_pages
        submitted, answer_text = _read_sheet(input)
        expected = self._expected(input)
        return [
            {"field": "page.visited", "expected": "voice", "actual": cm.visited_pages, "passed": visited},
            {"field": "answer_sheet.submitted", "expected": True, "actual": submitted, "passed": submitted is True},
            {"field": "answer.remaining_voice", "expected": expected, "actual": answer_text,
             "passed": bool(answer_text) and match_value(expected, answer_text)},
        ]


# =============================================================================
# Operate tasks
# =============================================================================

class RechargeFifty(BaseTask):
    """为当前号码充值50元话费。

    判定：余额恰好增加50元，且新增一条金额为50的充值交易记录（证明真实
    走了充值流程而非仅 toast）。充值写入 balance + transactions。
    """

    templates = ["打开中国移动，为当前号码充值50元话费。"]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 30
    capabilities = ["nav", "operate", "form"]

    parameters = {"amount": {"type": "number", "default": 50}}
    expected_changes = ["balance", "transactions"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        cm = ChinaMobile(input.apps["chinamobile"], init=input.apps_init["chinamobile"])
        init_balance = cm.init.balance
        curr_balance = cm.balance
        expected_balance = _round2(init_balance + 50)
        init_txn_ids = {str(t.get("id") or "") for t in cm.init.transactions}
        new_txns = [t for t in cm.transactions if str(t.get("id") or "") not in init_txn_ids]
        has_recharge_50 = any(
            t.get("type") == "recharge" and abs(float(t.get("amount") or 0) - 50) < 1e-6
            for t in new_txns
        )
        return [
            {"field": "balance.increased_by_50", "expected": expected_balance, "actual": curr_balance,
             "passed": abs(curr_balance - expected_balance) < 1e-6},
            {"field": "transaction.recharge_50", "expected": "recharge 50.0", "actual": new_txns,
             "passed": has_recharge_50},
        ]


class PayArrears(BaseTask):
    """缴清指定欠费账单。

    判定：欠费账单 status 变为 paid、余额恰好减少账单金额、新增一条缴费
    交易记录。已支付账单不可重复支付（store 拒绝）。
    """

    templates = ["打开中国移动，找到{month}月的欠费账单并缴清。"]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 45
    capabilities = ["nav", "operate"]

    parameters = {
        "billId": {"type": "string", "default": "bill-2026-06"},
        "month": {"type": "string", "default": "2026-06"},
        "amount": {"type": "number", "default": 12.80},
        "_bill": {
            "sampler": ChinaMobile.sample_arrears_bill,
            "fields": {"billId": "billId", "month": "month", "amount": "amount"},
        },
    }
    expected_changes = ["balance", "bills", "transactions"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        cm = ChinaMobile(input.apps["chinamobile"], init=input.apps_init["chinamobile"])
        bill = cm.bill_by_id(str(self.p.billId))
        bill_paid = bool(bill) and bill.get("status") == "paid"
        init_balance = cm.init.balance
        expected_balance = _round2(init_balance - float(self.p.amount))
        init_txn_ids = {str(t.get("id") or "") for t in cm.init.transactions}
        new_txns = [t for t in cm.transactions if str(t.get("id") or "") not in init_txn_ids]
        has_payment = any(
            t.get("type") == "payment" and abs(float(t.get("amount") or 0) - float(self.p.amount)) < 1e-6
            for t in new_txns
        )
        balance_ok = abs(cm.balance - expected_balance) < 1e-6
        return [
            {"field": "bill.paid", "expected": "paid", "actual": (bill or {}).get("status"),
             "passed": bill_paid},
            {"field": "balance.decreased", "expected": expected_balance, "actual": cm.balance,
             "passed": balance_ok},
            {"field": "transaction.payment", "expected": f"payment {self.p.amount}", "actual": new_txns,
             "passed": has_payment},
        ]


class BuyDataPack(BaseTask):
    """购买指定的10GB流量加油包。

    判定：已购服务（purchasedPacks）新增该流量包，且剩余高速流量恰好增加
    10GB（真实生效，非 toast）。
    """

    templates = ["打开中国移动，在商城购买{packName}。"]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    max_steps = 45
    capabilities = ["nav", "operate"]

    parameters = {
        "packId": {"type": "string", "default": "pack-10gb"},
        "packName": {"type": "string", "default": "10GB流量加油包"},
        "dataGb": {"type": "number", "default": 10},
        "price": {"type": "number", "default": 15},
        "_pack": {
            "sampler": ChinaMobile.sample_data_pack,
            "fields": {"packId": "packId", "packName": "packName", "dataGb": "dataGb", "price": "price"},
        },
    }
    expected_changes = ["balance", "purchasedPacks", "transactions"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        cm = ChinaMobile(input.apps["chinamobile"], init=input.apps_init["chinamobile"])
        target_pack_id = str(self.p.packId)
        init_pack_ids = {str(p.get("id") or "") for p in cm.init.purchased_packs}
        new_packs = [p for p in cm.purchased_packs if str(p.get("id") or "") not in init_pack_ids]
        bought = any(str(p.get("packId") or "") == target_pack_id for p in new_packs)
        init_remaining = ChinaMobile.remaining_data_gb(input.apps_init["chinamobile"])
        curr_remaining = ChinaMobile.remaining_data_gb(input.apps["chinamobile"])
        data_delta = _round2(curr_remaining - init_remaining)
        data_ok = abs(data_delta - float(self.p.dataGb)) < 1e-6
        return [
            {"field": "purchased_packs.new", "expected": target_pack_id, "actual": new_packs,
             "passed": bought},
            {"field": "data.increased_by_pack", "expected": float(self.p.dataGb), "actual": data_delta,
             "passed": data_ok},
        ]


class ChangePlan(CriteriaTask):
    """将当前基础套餐变更为指定套餐（须经套餐详情+确认流程）。

    判定：activePlanId 变为目标套餐；store 记录套餐变更交易（transactions）。
    """

    templates = ["打开中国移动，将当前基础套餐变更为{planName}。"]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    max_steps = 45
    capabilities = ["nav", "operate"]

    parameters = {
        "planId": {"type": "string", "default": "plan-58"},
        "planName": {"type": "string", "default": "飞享套餐-58元"},
        "_plan": {
            "sampler": ChinaMobile.sample_plan,
            "fields": {"planId": "planId", "planName": "planName"},
        },
    }
    criteria = {"activePlanId": "{planId}"}
    expected_changes = ["transactions"]

    async def _post_sample(self, env: Any) -> None:
        # Guarantee the initial plan is the default active plan so the agent
        # must actually change it (idempotency across re-runs in a session).
        await env.set_state(
            {"apps": {"chinamobile": {"activePlanId": "plan-188"}}},
            deep=True,
            reload=False,
        )


class EnableRoaming(CriteriaTask):
    """开通国际漫游服务。判定 roaming.enabled=True（持久开关，非 toast）。"""

    templates = ["打开中国移动，开通国际漫游服务。"]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L1"
    max_steps = 30
    capabilities = ["nav", "settings"]

    criteria = {"roaming.enabled": True}
    # setRoaming also mirrors to settings.roamingEnabled.
    expected_changes = ["settings.roamingEnabled"]

    async def _post_sample(self, env: Any) -> None:
        await self._invert_criteria(env)


class DisableVas(CriteriaTask):
    """关闭指定的已订购增值业务。

    判定 subscribedServices[id=serviceId].enabled=False（持久状态，非 toast）。
    """

    templates = ["打开中国移动，关闭已订购的增值业务“{serviceName}”。"]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 30
    capabilities = ["nav", "settings"]

    parameters = {
        "serviceId": {"type": "string", "default": "vas-crbt"},
        "serviceName": {"type": "string", "default": "视频彩铃"},
        "_svc": {
            "sampler": ChinaMobile.sample_service_to_disable,
            "fields": {"serviceId": "serviceId", "serviceName": "serviceName"},
        },
    }
    criteria = {"subscribedServices[id={serviceId}].enabled": False}
    expected_changes = ["subscribedServices"]

    async def _post_sample(self, env: Any) -> None:
        # Ensure the target service starts enabled (default is enabled, but
        # guarantee it so the task always requires a toggle).
        svc_id = str(self.p.serviceId)
        patched = [
            {**s, "enabled": True if s.get("id") == svc_id else s.get("enabled")}
            for s in CHINA_MOBILE_SERVICES
        ]
        if not patched:
            return
        await env.set_state(
            {"apps": {"chinamobile": {"subscribedServices": patched}}},
            deep=True,
            reload=False,
        )


class EnableAutopay(CriteriaTask):
    """开启自动缴费并选择指定支付方式。

    判定 autopay.enabled=True 且 autopay.paymentMethodId=指定方式（持久状态）。
    """

    templates = [
        "打开中国移动，开启自动缴费并选择{methodLabel}作为缴费方式。",
    ]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 45
    capabilities = ["nav", "operate", "settings"]

    parameters = {
        "methodId": {"type": "string", "default": "pm-cmb"},
        "methodLabel": {"type": "string", "default": "招商银行储蓄卡（尾号1234）"},
        "_method": {
            "sampler": ChinaMobile.sample_payment_method,
            "fields": {"methodId": "methodId", "methodLabel": "methodLabel"},
        },
    }
    criteria = {
        "autopay.enabled": True,
        "autopay.paymentMethodId": "{methodId}",
    }
    expected_changes = ["autopay"]

    async def _post_sample(self, env: Any) -> None:
        # Start with auto-pay disabled and no method chosen.
        await env.set_state(
            {"apps": {"chinamobile": {"autopay": {"enabled": False, "paymentMethodId": None}}}},
            deep=True,
            reload=False,
        )


class AddFamilyNumber(BaseTask):
    """添加一个指定家庭号码并设置指定昵称。

    判定：familyNumbers 新增一条，phone 与 nickname 与采样一致。
    """

    templates = [
        "打开中国移动，添加一个亲情号码，手机号填{familyPhone}，昵称填{familyNickname}。",
    ]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 45
    capabilities = ["nav", "operate", "form"]

    parameters = {
        "familyPhone": {"type": "string", "default": "13900001234"},
        "familyNickname": {"type": "string", "default": "儿子"},
        "_fam": {
            "sampler": ChinaMobile.sample_family_to_add,
            "fields": {"familyPhone": "familyPhone", "familyNickname": "familyNickname"},
        },
    }
    expected_changes = ["familyNumbers"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        cm = ChinaMobile(input.apps["chinamobile"], init=input.apps_init["chinamobile"])
        target_phone = str(self.p.familyPhone)
        target_nick = str(self.p.familyNickname)
        not_in_init = not cm.init.family_by_phone(target_phone)
        new_entry = cm.family_by_phone(target_phone)
        phone_ok = bool(new_entry)
        nick_ok = bool(new_entry) and str(new_entry.get("nickname") or "") == target_nick
        return [
            {"field": "family_number.added", "expected": target_phone, "actual": new_entry,
             "passed": phone_ok and not_in_init},
            {"field": "family_number.nickname", "expected": target_nick,
             "actual": (new_entry or {}).get("nickname"), "passed": nick_ok},
        ]


class DeleteFamilyNumber(BaseTask):
    """删除一个指定家庭号码（须经确认弹窗）。

    判定：familyNumbers 不再包含目标号码。
    """

    templates = [
        "打开中国移动，删除亲情号码{familyNickname}（{familyPhone}）。",
    ]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 45
    capabilities = ["nav", "operate"]

    parameters = {
        "familyId": {"type": "string", "default": "fam-001"},
        "familyPhone": {"type": "string", "default": "13800100001"},
        "familyNickname": {"type": "string", "default": "爸爸"},
        "_fam": {
            "sampler": ChinaMobile.sample_family_to_delete,
            "fields": {"familyId": "familyId", "familyPhone": "familyPhone", "familyNickname": "familyNickname"},
        },
    }
    expected_changes = ["familyNumbers"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        cm = ChinaMobile(input.apps["chinamobile"], init=input.apps_init["chinamobile"])
        target_id = str(self.p.familyId)
        was_present = bool(cm.init.family_by_id(target_id))
        still_present = bool(cm.family_by_id(target_id))
        return [
            {"field": "family_number.removed", "expected": f"absent {target_id}",
             "actual": "still present" if still_present else "removed",
             "passed": was_present and not still_present},
        ]


class UpdateEmail(CriteriaTask):
    """将个人资料中的联系邮箱更新为指定地址。

    判定：profile.email == 指定邮箱（持久状态）。
    """

    templates = ["打开中国移动，将个人资料中的联系邮箱修改为{email}。"]
    apps = ["chinamobile"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 30
    capabilities = ["nav", "operate", "form"]

    parameters = {
        "email": {"type": "string", "default": "zhangwei2026@163.com"},
        "_email": {
            "sampler": ChinaMobile.sample_email,
            "fields": {"email": "email"},
        },
    }
    criteria = {"profile.email": "{email}"}

    async def _post_sample(self, env: Any) -> None:
        # Reset the email to the default so the agent must actually change it.
        await env.set_state(
            {"apps": {"chinamobile": {"profile": {"email": "zhangwei@139.com"}}}},
            deep=True,
            reload=False,
        )
