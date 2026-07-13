"""
GoogleDrive app task definitions — exactly 15 tasks.
"""
from __future__ import annotations

from typing import Any

from bench_env.task.base import BaseTask
from bench_env.task.common_tasks import AnswerTask, CriteriaTask, build_answer_checks
from bench_env.task.google_drive.app import GoogleDrive
from bench_env.task.judge import JudgeInput

# =============================================================================
# 1. SearchFileAndCheckOwner (L2, query) — Search for a unique keyword,
#    open the target file, and report the owner email via AnswerSheet.
# =============================================================================
class SearchFileAndCheckOwner(AnswerTask):
    templates = [
        "在 Google Drive 中搜索「{keyword}」，打开找到的文件，查看详细信息，然后告诉我这个文件的所有者邮箱地址。",
        "帮我搜索 Google Drive 里包含「{keyword}」的文件，点进去看看是谁的，回答所有者的邮箱。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["search", "extract"]
    parameters = {"keyword": {"type": "enum", "values": {"Marketing": "Marketing", "architecture": "architecture", "api-design": "api-design", "competitor": "competitor"}, "default": "Marketing", "description": "搜索关键词"}}
    answer_fields = [{"type": "text", "label": "所有者邮箱", "key": "owner_email"}]
    optimal_paths = [["home.search.open"]]

    def get_answer(self, _input: JudgeInput) -> Any:
        keyword = getattr(self.p,"keyword", "Marketing")
        gd_init = GoogleDrive(_input.apps_init.get("googledrive", {}))
        # Find the file matching the keyword
        for f in gd_init.active_files:
            if keyword.lower() in f.get("name", "").lower():
                return f.get("owner", "")
        return ""

    def get_expected_response(self, answer: Any, _input: JudgeInput) -> list[Any]:
        return [str(answer or "")]


# =============================================================================
# 2. FilterFilesByTypeAndCheckDate (L2, query) — Open My Drive, filter by type,
#    open the target file, report the last modified date.
# =============================================================================
class FilterFilesByTypeAndCheckDate(AnswerTask):
    templates = [
        "打开 Google Drive 的「我的云端硬盘」，筛选出{label}类型的文件，选择一个查看详情，然后告诉我它的最后修改日期。",
        "去我的云端硬盘，只看{label}，点开一个看看什么时候最后修改的，回答日期。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["search", "extract"]
    parameters = {"filterType": {"type": "enum", "values": {"document": "document", "spreadsheet": "spreadsheet", "presentation": "presentation", "pdf": "pdf"}, "default": "document"}, "label": {"type": "enum", "values": {"document": "文档", "spreadsheet": "表格", "presentation": "演示文稿", "pdf": "PDF"}, "default": "文档"}}
    answer_fields = [{"type": "text", "label": "最后修改日期", "key": "modified_date"}]

    def get_answer(self, _input: JudgeInput) -> Any:
        filter_type = getattr(self.p,"filterType", "document")
        gd_init = GoogleDrive(_input.apps_init.get("googledrive", {}))
        # Return the modified date of the first file matching the filter type
        for f in gd_init.active_files:
            if f.get("type") == filter_type:
                from datetime import datetime
                ts = f.get("modifiedTime", 0)
                if ts:
                    dt = datetime.fromtimestamp(ts / 1000.0)
                    return dt.strftime("%Y-%m-%d")
        return ""


# =============================================================================
# 3. CreateNewFolder (L2, operate) — Create a new folder with a specific name.
# =============================================================================
class CreateNewFolder(CriteriaTask):
    templates = [
        "在 Google Drive 首页点击新建 → 文件夹，创建一个名为「{folderName}」的文件夹。",
        "帮我在 Google Drive 里新建一个文件夹，名字叫「{folderName}」。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["create"]
    parameters = {"folderName": {"type": "enum", "values": {"project-alpha": "project-alpha", "design-assets": "design-assets", "meeting-notes": "meeting-notes"}, "default": "project-alpha", "description": "文件夹名称"}}

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        folder_name = getattr(self.p,"folderName", "")
        gd = GoogleDrive(input.apps.get("googledrive", {}))
        gd_init = GoogleDrive(input.apps_init.get("googledrive", {}))

        # Find newly created folder
        init_ids = {f.get("id") for f in gd_init.files}
        new_folders = [f for f in gd.files if f.get("id") not in init_ids]

        folder_found = any(f.get("name") == folder_name and f.get("type") == "folder" and not f.get("trashed") for f in new_folders)

        return [{
            "passed": folder_found,
            "expected": f"New folder named '{folder_name}' with type=folder, trashed=false",
            "actual": f"Found {len(new_folders)} new items: {[(f.get('name'), f.get('type'), f.get('trashed')) for f in new_folders]}",
        }]


# =============================================================================
# 4. UploadDeviceFile (L2, operate) — Upload a simulated device file.
# =============================================================================
class UploadDeviceFile(CriteriaTask):
    templates = [
        "在 Google Drive 中上传设备上的文件「{fileName}」（通过新建 → 上传文件 → 选择文件）。",
        "帮我把设备里的「{fileName}」上传到 Google Drive 根目录。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["create"]
    parameters = {
        "fileName": {"type": "enum", "values": {"quarterly-plan.pdf": "quarterly-plan.pdf", "field-notes.txt": "field-notes.txt", "budget-forecast.xlsx": "budget-forecast.xlsx", "product-demo.pptx": "product-demo.pptx"}, "default": "quarterly-plan.pdf", "description": "要上传的设备文件名"},
    }

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        file_name = getattr(self.p,"fileName", "")
        gd = GoogleDrive(input.apps.get("googledrive", {}))
        gd_init = GoogleDrive(input.apps_init.get("googledrive", {}))

        init_ids = {f.get("id") for f in gd_init.files}
        new_files = [f for f in gd.files if f.get("id") not in init_ids]

        file_found = any(f.get("name") == file_name and not f.get("trashed") and f.get("parentId") is None for f in new_files)

        return [{
            "passed": file_found,
            "expected": f"New file named '{file_name}' uploaded to root (parentId=null), not trashed",
            "actual": f"New files: {[(f.get('name'), f.get('parentId'), f.get('trashed')) for f in new_files]}",
        }]


# =============================================================================
# 5. RenameFile (L2, operate) — Rename a specified file.
# =============================================================================
class RenameFile(CriteriaTask):
    templates = [
        "在 Google Drive 中找到「{fileName}」这个文件，把它重命名为「{newName}」。",
        "帮我把「{fileName}」的名字改成「{newName}」。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["edit"]
    parameters = {
        "fileName": {"type": "enum", "values": {"meeting-notes-2026-07-01": "meeting-notes-2026-07-01", "onboarding-guide": "onboarding-guide", "server-log-archive.zip": "server-log-archive.zip"}, "default": "meeting-notes-2026-07-01"},
        "newName": {"type": "enum", "values": {"meeting-notes-july-renamed": "meeting-notes-july-renamed", "onboarding-handbook-v2": "onboarding-handbook-v2", "server-logs-q1.zip": "server-logs-q1.zip"}, "default": "meeting-notes-july-renamed"},
        "fileId": {"type": "enum", "values": {"file-007": "file-007", "file-008": "file-008", "file-018": "file-018"}, "default": "file-007"},
    }

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        file_id = getattr(self.p,"fileId", "")
        new_name = getattr(self.p,"newName", "")
        gd = GoogleDrive(input.apps.get("googledrive", {}))
        f = gd.file_by_id(file_id)

        renamed = f is not None and f.get("name") == new_name

        return [{
            "passed": renamed,
            "expected": f"File '{file_id}' renamed to '{new_name}'",
            "actual": f"File name: {f.get('name') if f else 'NOT FOUND'}",
        }]


# =============================================================================
# 6. MoveFileToFolder (L2, operate) — Move a file to a target folder.
# =============================================================================
class MoveFileToFolder(CriteriaTask):
    templates = [
        "在 Google Drive 中找到「{fileName}」，把它移动到「{targetName}」文件夹里。",
        "帮我把「{fileName}」移到「{targetName}」文件夹下面。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["edit"]
    parameters = {
        "fileId": {"type": "enum", "values": {"file-007": "file-007", "file-018": "file-018", "file-019": "file-019"}, "default": "file-007"},
        "fileName": {"type": "enum", "values": {"meeting-notes-2026-07-01": "meeting-notes-2026-07-01", "server-log-archive.zip": "server-log-archive.zip", "welcome-video.mp4": "welcome-video.mp4"}, "default": "meeting-notes-2026-07-01"},
        "targetParentId": {"type": "enum", "values": {"file-010": "file-010", "file-011": "file-011"}, "default": "file-010"},
        "targetName": {"type": "enum", "values": {"Marketing": "Marketing", "Engineering": "Engineering"}, "default": "Marketing"},
    }

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        file_id = getattr(self.p,"fileId", "")
        target_id = getattr(self.p,"targetParentId", "")
        gd = GoogleDrive(input.apps.get("googledrive", {}))
        f = gd.file_by_id(file_id)

        moved = f is not None and f.get("parentId") == target_id and not f.get("trashed")

        return [{
            "passed": moved,
            "expected": f"File '{file_id}' moved to parent '{target_id}'",
            "actual": f"File parentId: {f.get('parentId') if f else 'NOT FOUND'}, trashed: {f.get('trashed') if f else 'N/A'}",
        }]


# =============================================================================
# 7. StarFile (L2, operate) — Add a star to a file.
# =============================================================================
class StarFile(CriteriaTask):
    templates = [
        "找到 Google Drive 中的「{fileName}」文件，给它添加星标。",
        "帮我把「{fileName}」加上星标。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["edit"]
    parameters = {
        "fileId": {"type": "enum", "values": {"file-002": "file-002", "file-007": "file-007", "file-009": "file-009"}, "default": "file-002"},
        "fileName": {"type": "enum", "values": {"Annual Budget 2026": "Annual Budget 2026", "meeting-notes-2026-07-01": "meeting-notes-2026-07-01", "expense-report-june": "expense-report-june"}, "default": "Annual Budget 2026"},
    }

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        file_id = getattr(self.p,"fileId", "")
        gd = GoogleDrive(input.apps.get("googledrive", {}))
        f = gd.file_by_id(file_id)

        starred = f is not None and f.get("starred") is True

        # Also check it appears in starred view
        gd_starred = [sf.get("id") for sf in gd.starred_files]
        in_starred_list = file_id in gd_starred

        return [
            {"passed": starred, "expected": f"File '{file_id}' starred=True", "actual": f"starred: {f.get('starred') if f else 'NOT FOUND'}"},
            {"passed": in_starred_list, "expected": f"File '{file_id}' appears in starred list", "actual": f"Starred file IDs: {gd_starred}"},
        ]


# =============================================================================
# 8. UnstarFile (L2, operate) — Remove star from a file.
# =============================================================================
class UnstarFile(CriteriaTask):
    templates = [
        "在 Google Drive 中找到「{fileName}」，取消它的星标。",
        "帮我把「{fileName}」的星标去掉。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["edit"]
    parameters = {
        "fileId": {"type": "enum", "values": {"file-001": "file-001", "file-004": "file-004", "file-006": "file-006"}, "default": "file-001"},
        "fileName": {"type": "enum", "values": {"Q4 Marketing Strategy": "Q4 Marketing Strategy", "Engineering Roadmap 2026": "Engineering Roadmap 2026", "team-offsite-photos": "team-offsite-photos"}, "default": "Q4 Marketing Strategy"},
    }

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        file_id = getattr(self.p,"fileId", "")
        gd = GoogleDrive(input.apps.get("googledrive", {}))
        f = gd.file_by_id(file_id)

        unstarred = f is not None and f.get("starred") is False
        file_exists = f is not None and not f.get("trashed")

        return [
            {"passed": unstarred, "expected": f"File '{file_id}' starred=False", "actual": f"starred: {f.get('starred') if f else 'NOT FOUND'}"},
            {"passed": file_exists, "expected": f"File '{file_id}' still exists (not trashed)", "actual": f"trashed: {f.get('trashed') if f else 'N/A'}"},
        ]


# =============================================================================
# 9. ShareFileWithViewer (L2, operate) — Share a file with a user as viewer.
# =============================================================================
class ShareFileWithViewer(CriteriaTask):
    templates = [
        "把 Google Drive 中的「{fileName}」分享给 {email}，设置为查看者权限。",
        "帮我分享「{fileName}」给 {email}，只能查看。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["share"]
    parameters = {
        "fileId": {"type": "enum", "values": {"file-007": "file-007", "file-009": "file-009"}, "default": "file-007"},
        "fileName": {"type": "enum", "values": {"meeting-notes-2026-07-01": "meeting-notes-2026-07-01", "expense-report-june": "expense-report-june"}, "default": "meeting-notes-2026-07-01"},
        "email": {"type": "enum", "values": {"frank.wu@partner.com": "frank.wu@partner.com", "grace.liu@company.com": "grace.liu@company.com"}, "default": "frank.wu@partner.com"},
        "role": {"type": "enum", "values": {"viewer": "viewer"}, "default": "viewer"},
    }

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        file_id = getattr(self.p,"fileId", "")
        email = getattr(self.p,"email", "")
        expected_role = getattr(self.p,"role", "viewer")
        gd = GoogleDrive(input.apps.get("googledrive", {}))
        gd_init = GoogleDrive(input.apps_init.get("googledrive", {}))
        f = gd.file_by_id(file_id)

        # Check new permission was added
        init_perms = gd_init.file_by_id(file_id)
        init_emails = {p.get("email") for p in (init_perms.get("permissions", []) if init_perms else [])}
        current_perms = f.get("permissions", []) if f else []
        new_perm = next((p for p in current_perms if p.get("email") == email and p.get("email") not in init_emails), None)

        shared = new_perm is not None and new_perm.get("role") == expected_role

        return [{
            "passed": shared,
            "expected": f"New permission for '{email}' with role='{expected_role}' on file '{file_id}'",
            "actual": f"Permissions: {[(p.get('email'), p.get('role')) for p in current_perms]}",
        }]


# =============================================================================
# 10. ChangeViewerToEditor (L3, operate) — Change a collaborator from viewer to editor.
# =============================================================================
class ChangeViewerToEditor(CriteriaTask):
    templates = [
        "在 Google Drive 中找到「{fileName}」，进入管理访问权限，把 {email} 的权限从查看者改为编辑者。",
        "帮我把「{fileName}」的协作者 {email} 的权限从只能查看升级为可以编辑。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["share"]
    parameters = {
        "fileId": {"type": "enum", "values": {"file-008": "file-008", "file-020": "file-020"}, "default": "file-008"},
        "fileName": {"type": "enum", "values": {"onboarding-guide": "onboarding-guide", "competitor-analysis-2026": "competitor-analysis-2026"}, "default": "onboarding-guide"},
        "permissionId": {"type": "enum", "values": {"perm-012": "perm-012", "perm-026": "perm-026"}, "default": "perm-012"},
        "email": {"type": "enum", "values": {"eve.zhang@company.com": "eve.zhang@company.com", "alex.chen@gmail.com": "alex.chen@gmail.com"}, "default": "eve.zhang@company.com"},
    }

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        file_id = getattr(self.p,"fileId", "")
        perm_id = getattr(self.p,"permissionId", "")
        email = getattr(self.p,"email", "")
        gd = GoogleDrive(input.apps.get("googledrive", {}))
        f = gd.file_by_id(file_id)

        perm = None
        if f:
            for p in f.get("permissions", []):
                if p.get("id") == perm_id:
                    perm = p
                    break

        role_changed = perm is not None and perm.get("role") == "editor" and perm.get("email") == email

        return [{
            "passed": role_changed,
            "expected": f"Permission '{perm_id}' for '{email}' changed to role='editor'",
            "actual": f"Permission: {perm}",
        }]


# =============================================================================
# 11. RemoveCollaborator (L2, operate) — Remove a collaborator from a file.
# =============================================================================
class RemoveCollaborator(CriteriaTask):
    templates = [
        "在 Google Drive 中找到「{fileName}」，进入管理访问权限，移除协作者 {email} 的访问权限。",
        "帮我把「{fileName}」的共享用户 {email} 删掉。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["share"]
    parameters = {
        "fileId": {"type": "enum", "values": {"file-008": "file-008", "file-020": "file-020"}, "default": "file-008"},
        "fileName": {"type": "enum", "values": {"onboarding-guide": "onboarding-guide", "competitor-analysis-2026": "competitor-analysis-2026"}, "default": "onboarding-guide"},
        "permissionId": {"type": "enum", "values": {"perm-012": "perm-012", "perm-026": "perm-026"}, "default": "perm-012"},
        "email": {"type": "enum", "values": {"eve.zhang@company.com": "eve.zhang@company.com", "alex.chen@gmail.com": "alex.chen@gmail.com"}, "default": "eve.zhang@company.com"},
    }

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        file_id = getattr(self.p,"fileId", "")
        perm_id = getattr(self.p,"permissionId", "")
        gd = GoogleDrive(input.apps.get("googledrive", {}))
        f = gd.file_by_id(file_id)

        perm_exists = False
        if f:
            for p in f.get("permissions", []):
                if p.get("id") == perm_id:
                    perm_exists = True
                    break

        removed = not perm_exists

        return [{
            "passed": removed,
            "expected": f"Permission '{perm_id}' removed from file '{file_id}'",
            "actual": f"Permission '{perm_id}' exists: {perm_exists}",
        }]


# =============================================================================
# 12. SetLinkAccessToAnyone (L2, operate) — Change link access to anyone with link.
# =============================================================================
class SetLinkAccessToAnyone(CriteriaTask):
    templates = [
        "在 Google Drive 中找到「{fileName}」，把链接访问权限从「受限」改为「知道链接的任何人 — 查看者」。",
        "帮我把「{fileName}」的分享链接权限改成知道链接就能查看。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["share"]
    parameters = {
        "fileId": {"type": "enum", "values": {"file-007": "file-007", "file-008": "file-008"}, "default": "file-007"},
        "fileName": {"type": "enum", "values": {"meeting-notes-2026-07-01": "meeting-notes-2026-07-01", "onboarding-guide": "onboarding-guide"}, "default": "meeting-notes-2026-07-01"},
    }

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        file_id = getattr(self.p,"fileId", "")
        gd = GoogleDrive(input.apps.get("googledrive", {}))
        f = gd.file_by_id(file_id)

        link_changed = f is not None and f.get("linkAccess") == "anyone_viewer"
        has_link = f is not None and f.get("shareableLink") is not None

        return [
            {"passed": link_changed, "expected": f"File '{file_id}' linkAccess='anyone_viewer'", "actual": f"linkAccess: {f.get('linkAccess') if f else 'NOT FOUND'}"},
            {"passed": has_link, "expected": f"File '{file_id}' has shareableLink", "actual": f"shareableLink: {f.get('shareableLink') if f else 'N/A'}"},
        ]


# =============================================================================
# 13. TrashFile (L2, operate) — Move a file to trash.
# =============================================================================
class TrashFile(CriteriaTask):
    templates = [
        "在 Google Drive 中找到「{fileName}」，把它移到回收站。",
        "帮我把「{fileName}」删掉（移到回收站即可）。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["delete"]
    parameters = {
        "fileId": {"type": "enum", "values": {"file-007": "file-007", "file-018": "file-018", "file-019": "file-019"}, "default": "file-007"},
        "fileName": {"type": "enum", "values": {"meeting-notes-2026-07-01": "meeting-notes-2026-07-01", "server-log-archive.zip": "server-log-archive.zip", "welcome-video.mp4": "welcome-video.mp4"}, "default": "meeting-notes-2026-07-01"},
    }

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        file_id = getattr(self.p,"fileId", "")
        gd = GoogleDrive(input.apps.get("googledrive", {}))
        f = gd.file_by_id(file_id)

        trashed = f is not None and f.get("trashed") is True
        has_original_parent = f is not None and f.get("trashedFromParentId") is not None

        # Should NOT appear in active files
        in_active = file_id in {af.get("id") for af in gd.active_files}

        return [
            {"passed": trashed, "expected": f"File '{file_id}' trashed=True", "actual": f"trashed: {f.get('trashed') if f else 'NOT FOUND'}"},
            {"passed": has_original_parent, "expected": f"File '{file_id}' has trashedFromParentId", "actual": f"trashedFromParentId: {f.get('trashedFromParentId') if f else 'N/A'}"},
            {"passed": not in_active, "expected": f"File '{file_id}' NOT in active files", "actual": f"In active files: {in_active}"},
        ]


# =============================================================================
# 14. RestoreFromTrash (L2, operate) — Restore a file from trash.
# =============================================================================
class RestoreFromTrash(CriteriaTask):
    templates = [
        "进入 Google Drive 的回收站，找到「{fileName}」，把它恢复回来。",
        "帮我把回收站里的「{fileName}」还原到原来的位置。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["edit"]
    parameters = {
        "fileId": {"type": "enum", "values": {"file-015": "file-015"}, "default": "file-015"},
        "fileName": {"type": "enum", "values": {"Trash Old Draft": "Trash Old Draft"}, "default": "Trash Old Draft"},
        "originalParentId": {"type": "enum", "values": {"file-010": "file-010"}, "default": "file-010"},
    }

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        file_id = getattr(self.p,"fileId", "")
        orig_parent = getattr(self.p,"originalParentId", "")
        gd = GoogleDrive(input.apps.get("googledrive", {}))
        f = gd.file_by_id(file_id)

        restored = f is not None and f.get("trashed") is False
        back_in_place = f is not None and f.get("parentId") == orig_parent

        # Should NOT be in trash
        in_trash = file_id in {tf.get("id") for tf in gd.trashed_files}

        return [
            {"passed": restored, "expected": f"File '{file_id}' trashed=False", "actual": f"trashed: {f.get('trashed') if f else 'NOT FOUND'}"},
            {"passed": back_in_place, "expected": f"File '{file_id}' parentId restored to '{orig_parent}'", "actual": f"parentId: {f.get('parentId') if f else 'N/A'}"},
            {"passed": not in_trash, "expected": f"File '{file_id}' NOT in trash", "actual": f"In trash: {in_trash}"},
        ]


# =============================================================================
# 15. PermanentlyDeleteFile (L2, operate) — Permanently delete a trashed file.
# =============================================================================
class PermanentlyDeleteFile(CriteriaTask):
    templates = [
        "进入 Google Drive 回收站，找到「{fileName}」，把它永久删除。",
        "帮我把回收站里的「{fileName}」彻底删除，不再保留。",
    ]
    apps = ["googledrive"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["delete"]
    parameters = {
        "fileId": {"type": "enum", "values": {"file-016": "file-016", "file-017": "file-017"}, "default": "file-016"},
        "fileName": {"type": "enum", "values": {"Old Presentation Template": "Old Presentation Template", "draft-proposal-to-delete": "draft-proposal-to-delete"}, "default": "Old Presentation Template"},
    }

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        file_id = getattr(self.p,"fileId", "")
        gd = GoogleDrive(input.apps.get("googledrive", {}))
        f = gd.file_by_id(file_id)

        gone = f is None  # File should no longer exist at all

        # Also check not in trash
        in_trash = file_id in {tf.get("id") for tf in gd.trashed_files}
        in_active = file_id in {af.get("id") for af in gd.active_files}

        return [
            {"passed": gone, "expected": f"File '{file_id}' permanently deleted (not found)", "actual": f"File exists: {f is not None}"},
            {"passed": not in_trash, "expected": f"File '{file_id}' NOT in trash", "actual": f"In trash: {in_trash}"},
            {"passed": not in_active, "expected": f"File '{file_id}' NOT in active files", "actual": f"In active: {in_active}"},
        ]
