
import React from "react";
import * as Toast from "@radix-ui/react-toast";
import { useNotificationStore } from "@/store/notificationStore";
import { CheckCircledIcon, CrossCircledIcon, InfoCircledIcon } from "@radix-ui/react-icons";

const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

export const NotificationProvider = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <Toast.Provider swipeDirection="right">
      {notifications.map(({ id, type, title, message }) => (
        <Toast.Root
          key={id}
          className={`list-none rounded-md p-4 text-white shadow-lg ${typeClasses[type]}`}
          onOpenChange={() => removeNotification(id)}
        >
            <div className="flex items-center gap-4">
                {type === 'success' && <CheckCircledIcon className="w-6 h-6" />}
                {type === 'error' && <CrossCircledIcon className="w-6 h-6" />}
                {type === 'warning' && <InfoCircledIcon className="w-6 h-6" />}
                {type === 'info' && <InfoCircledIcon className="w-6 h-6" />}
                <div>
                    <Toast.Title className="font-bold">{title}</Toast.Title>
                    <Toast.Description>{message}</Toast.Description>
                </div>
            </div>
          <Toast.Close />
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-0 right-0 z-50 flex w-96 flex-col gap-2 p-4" />
    </Toast.Provider>
  );
};
