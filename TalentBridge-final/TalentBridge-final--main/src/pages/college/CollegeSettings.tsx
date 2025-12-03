import { useState, useEffect } from "react";
import CollegeLayout from "@/components/layouts/CollegeLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTheme } from "next-themes";

// LocalStorage keys
const STORAGE_KEYS = {
  EMAIL_NOTIFICATIONS: "college_settings_email_notifications",
  PUSH_NOTIFICATIONS: "college_settings_push_notifications",
  TWO_FACTOR_AUTH: "college_settings_two_factor_auth",
  THEME: "college_settings_theme",
} as const;

const CollegeSettings = () => {
  const { theme, setTheme } = useTheme();
  
  // State for all settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("system");
  
  // Password change dialog state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Delete account dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      const savedEmailNotifications = localStorage.getItem(STORAGE_KEYS.EMAIL_NOTIFICATIONS);
      const savedPushNotifications = localStorage.getItem(STORAGE_KEYS.PUSH_NOTIFICATIONS);
      const savedTwoFactorAuth = localStorage.getItem(STORAGE_KEYS.TWO_FACTOR_AUTH);
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);

      if (savedEmailNotifications !== null) {
        setEmailNotifications(savedEmailNotifications === "true");
      }
      if (savedPushNotifications !== null) {
        setPushNotifications(savedPushNotifications === "true");
      }
      if (savedTwoFactorAuth !== null) {
        setTwoFactorAuth(savedTwoFactorAuth === "true");
      }
      if (savedTheme) {
        setSelectedTheme(savedTheme);
        setTheme(savedTheme);
      }
    };

    loadSettings();
  }, [setTheme]);

  // Sync selectedTheme with theme from useTheme
  useEffect(() => {
    if (theme) {
      setSelectedTheme(theme);
    }
  }, [theme]);

  // Save email notifications
  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked);
    localStorage.setItem(STORAGE_KEYS.EMAIL_NOTIFICATIONS, checked.toString());
    toast.success(checked ? "Email notifications enabled" : "Email notifications disabled");
  };

  // Save push notifications
  const handlePushNotificationsChange = (checked: boolean) => {
    setPushNotifications(checked);
    localStorage.setItem(STORAGE_KEYS.PUSH_NOTIFICATIONS, checked.toString());
    toast.success(checked ? "Push notifications enabled" : "Push notifications disabled");
  };

  // Save two-factor authentication
  const handleTwoFactorAuthChange = (checked: boolean) => {
    setTwoFactorAuth(checked);
    localStorage.setItem(STORAGE_KEYS.TWO_FACTOR_AUTH, checked.toString());
    if (checked) {
      toast.success("Two-factor authentication enabled");
    } else {
      toast.warning("Two-factor authentication disabled");
    }
  };

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    toast.success(`Theme changed to ${newTheme === "system" ? "system default" : newTheme}`);
  };

  // Handle password change
  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Simulate password change
    toast.success("Password changed successfully");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsPasswordDialogOpen(false);
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    if (deleteConfirmation.toLowerCase() !== "delete") {
      toast.error("Please type 'DELETE' to confirm");
      return;
    }

    // Simulate account deletion
    toast.error("Account deletion requires admin approval. Your request has been submitted.");
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(false);
  };

  return (
    <CollegeLayout>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          {/* Preferences Section */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <Select value={selectedTheme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Notifications Section */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email updates about placements</p>
                </div>
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={handleEmailNotificationsChange}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications for important events</p>
                </div>
                <Switch 
                  checked={pushNotifications}
                  onCheckedChange={handlePushNotificationsChange}
                />
              </div>
            </div>
          </Card>

          {/* Privacy & Security Section */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Privacy & Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch 
                  checked={twoFactorAuth}
                  onCheckedChange={handleTwoFactorAuthChange}
                />
              </div>
              <Separator />
              <div>
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Change Password</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new one.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          }
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          }
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsPasswordDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handlePasswordChange}>Change Password</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>

          {/* Danger Zone Section */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-destructive">Danger Zone</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all associated data. Type <strong>DELETE</strong> to confirm.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Input
                        placeholder="Type DELETE to confirm"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </CollegeLayout>
  );
};

export default CollegeSettings;
