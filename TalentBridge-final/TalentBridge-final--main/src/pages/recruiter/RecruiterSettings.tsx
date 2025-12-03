import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  EMAIL_NOTIFICATIONS: "recruiter_settings_email_notifications",
  PUSH_NOTIFICATIONS: "recruiter_settings_push_notifications",
  THEME: "recruiter_settings_theme",
} as const;

const RecruiterSettings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // State for all settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string>("system");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Password change dialog state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Logout/Delete dialog state
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      const savedEmailNotifications = localStorage.getItem(STORAGE_KEYS.EMAIL_NOTIFICATIONS);
      const savedPushNotifications = localStorage.getItem(STORAGE_KEYS.PUSH_NOTIFICATIONS);
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);

      if (savedEmailNotifications !== null) {
        setEmailNotifications(savedEmailNotifications === "true");
      }
      if (savedPushNotifications !== null) {
        setPushNotifications(savedPushNotifications === "true");
      }
      if (savedTheme) {
        setSelectedTheme(savedTheme);
        setTheme(savedTheme);
        setIsDarkMode(savedTheme === "dark");
      }
    };

    loadSettings();
  }, [setTheme]);

  // Sync selectedTheme with theme from useTheme
  useEffect(() => {
    if (theme) {
      setSelectedTheme(theme);
      setIsDarkMode(theme === "dark");
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

  // Handle dark mode toggle
  const handleDarkModeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    const newTheme = checked ? "dark" : "light";
    setSelectedTheme(newTheme);
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    toast.success(checked ? "Dark mode enabled" : "Dark mode disabled");
  };

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    setIsDarkMode(newTheme === "dark");
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

  // Handle logout
  const handleLogout = () => {
    toast.success("Logged out successfully");
    setIsLogoutDialogOpen(false);
    setTimeout(() => {
      navigate("/");
    }, 1000);
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
    <RecruiterLayout>
      <div className="container mx-auto px-8 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Settings</h1>
          <p className="text-lg text-muted-foreground font-medium">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          {/* Preferences Section */}
          <Card className="p-8 rounded-2xl shadow-xl bg-card/80 dark:bg-card backdrop-blur">
            <h3 className="font-bold text-xl mb-6">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-semibold">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
                </div>
                <Switch 
                  checked={isDarkMode}
                  onCheckedChange={handleDarkModeChange}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-semibold">Theme</p>
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
          <Card className="p-8 rounded-2xl shadow-xl bg-card/80 dark:bg-card backdrop-blur">
            <h3 className="font-bold text-xl mb-6">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-semibold">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email about new applications</p>
                </div>
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={handleEmailNotificationsChange}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-semibold">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified about shortlisted candidates</p>
                </div>
                <Switch 
                  checked={pushNotifications}
                  onCheckedChange={handlePushNotificationsChange}
                />
              </div>
            </div>
          </Card>

          {/* Privacy & Security Section */}
          <Card className="p-8 rounded-2xl shadow-xl bg-card/80 dark:bg-card backdrop-blur">
            <h3 className="font-bold text-xl mb-6">Privacy & Security</h3>
            <div className="space-y-4">
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl">
                    Change Password
                  </Button>
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
          </Card>

          {/* Account Section */}
          <Card className="p-8 rounded-2xl shadow-xl bg-card/80 dark:bg-card backdrop-blur">
            <h3 className="font-bold text-xl mb-6">Account</h3>
            <div className="space-y-4">
              <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl">
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be logged out of your account and redirected to the home page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLogout}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="rounded-xl">
                      Delete Account
                    </Button>
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
    </RecruiterLayout>
  );
};

export default RecruiterSettings;
