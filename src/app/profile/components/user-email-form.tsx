"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Inbox, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { userApi } from "@/api/userProfileApi";
import { getApiErrorMessage, getApiSuccessMessage } from "../utils";

interface UserEmailFormProps {
  email: string;
}

export function UserEmailForm({ email }: UserEmailFormProps) {
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkMailDialogOpen, setCheckMailDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [error, setError] = useState("");

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError("Email không hợp lệ");
      return;
    }
    if (newEmail.trim().toLowerCase() === email.trim().toLowerCase()) {
      setError("Email mới phải khác email hiện tại");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await userApi.updateEmail({ newEmail: newEmail.trim() });
      const msg = getApiSuccessMessage(
        res.data,
        "Vui lòng kiểm tra email mới để xác thực và hoàn tất cập nhật",
      );
      setDialogMessage(msg);
      setCheckMailDialogOpen(true);
      setNewEmail("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gửi yêu cầu đổi email thất bại"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={checkMailDialogOpen} onOpenChange={setCheckMailDialogOpen}>
        <DialogContent
          showCloseButton
          className={cn(
            "gap-0 overflow-hidden border-0 p-0 shadow-2xl ring-1 ring-black/5",
            "sm:max-w-[420px]",
            "dark:ring-white/10",
          )}
        >
          <div
            className={cn(
              "relative px-6 pt-10 pb-8 text-center",
              "bg-linear-to-b from-sky-500/12 via-primary/8 to-transparent",
              "dark:from-sky-500/25 dark:via-primary/15 dark:to-transparent",
            )}
          >
            <DialogHeader className="relative space-y-2 text-center sm:text-center">
              <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                Kiểm tra hộp thư
              </DialogTitle>
              <DialogDescription className="text-base leading-relaxed text-foreground/85">
                {dialogMessage}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 pb-2">
            <div
              className={cn(
                "rounded-xl border border-sky-200/60 bg-sky-50/80 px-4 py-3 text-left text-sm",
                "text-sky-950/90 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-100/95",
              )}
            >
              <p className="flex gap-2 leading-relaxed">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                <span>
                  Mở <strong>email mới</strong> bạn vừa nhập, nhấn liên kết xác
                  nhận để hoàn tất đổi địa chỉ đăng nhập.
                </span>
              </p>
            </div>
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              Không thấy thư trong vài phút? Kiểm tra thư mục{" "}
              <span className="font-medium text-foreground/80">Spam</span> hoặc{" "}
              <span className="font-medium text-foreground/80">Quảng cáo</span>.
            </p>
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/40 px-6 py-4 sm:justify-stretch">
            <Button
              type="button"
              className={cn(
                "h-11 w-full font-semibold shadow-md",
                "bg-theme-primary-start hover:opacity-90 text-white",
                "transition-transform active:scale-[0.98]",
              )}
              onClick={() => setCheckMailDialogOpen(false)}
            >
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-white dark:bg-surface-card rounded-xl border border-gray-200 dark:border-white/8 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/8">
          <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center">
            <Mail size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-main">
              Đổi email
            </h2>
            <p className="text-xs text-text-sub">
              Email hiện tại:{" "}
              <span className="font-medium text-text-main">{email}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-sub uppercase tracking-wide">
              Email mới
            </label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setError("");
              }}
              placeholder="email-moi@domain.com"
              className="bg-gray-50/50 dark:bg-white/5"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <p className="text-[11px] text-text-sub leading-relaxed">
            Sau khi gửi, hệ thống sẽ gửi liên kết tới email mới. Mở email và
            nhấn xác nhận để hoàn tất đổi địa chỉ đăng nhập.
          </p>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={saving || !newEmail.trim()}
              className="bg-theme-primary-start hover:opacity-90"
            >
              {saving ? "Đang gửi..." : "Gửi yêu cầu đổi email"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
