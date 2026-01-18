"use client";

import { useState } from "react";
import Card from "./Card";
import { IconCheck } from "@tabler/icons-react";
import { useCsrfToken } from "@/hooks/useCsrfToken";

interface Notification {
  id: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

export default function NotificationsList({ notifications }: { notifications: Notification[] }) {
  const [notifs, setNotifs] = useState(notifications);
  const csrfToken = useCsrfToken();

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ id }),
      });

      setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (notifs.length === 0) {
    return (
      <Card className="p-8 text-center text-zinc-600 dark:text-zinc-400">
        No notifications
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifs.map((notification) => (
        <Card
          key={notification.id}
          className={`p-4 ${!notification.read ? "border-l-4 border-l-zinc-900 dark:border-l-white" : ""}`}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="text-zinc-900 dark:text-white">{notification.message}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
            {!notification.read && (
              <button
                onClick={() => markAsRead(notification.id)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                aria-label="Mark as read"
              >
                <IconCheck size={20} className="text-zinc-600 dark:text-zinc-400" />
              </button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
