import { Toast } from "radix-ui";
import { useNotificationStore } from "@/store/notificationStore";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";

import "./Notification.css";

const typeIcons = {
  success: <CheckCircledIcon className="ToastIcon" />,
  error: <CrossCircledIcon className="ToastIcon" />,
  warning: <InfoCircledIcon className="ToastIcon" />,
  info: <InfoCircledIcon className="ToastIcon" />,
};

export const NotificationProvider = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <Toast.Provider swipeDirection="right">
      {notifications.map(({ id, type, title, message }) => (
        <Toast.Root
          key={id}
          className="ToastRoot"
          data-type={type}
          onOpenChange={() => {
            removeNotification(id);
          }}
        >
          {typeIcons[type]}
          <Toast.Title className="ToastTitle">{title}</Toast.Title>
          <Toast.Description className="ToastDescription">
            {message}
          </Toast.Description>
          <Toast.Close />
        </Toast.Root>
      ))}
      <Toast.Viewport className="ToastViewport" />
    </Toast.Provider>
  );
};
