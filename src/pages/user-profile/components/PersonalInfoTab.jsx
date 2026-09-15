import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { applyTheme } from '../../../utils/theme';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../utils/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';

const PersonalInfoTab = ({ user, onUpdateUser }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [editingField, setEditingField] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth || ''
  });

  // Sync when user prop changes
  React.useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      dateOfBirth: user?.dateOfBirth || ''
    });
  }, [user?.name, user?.email, user?.dateOfBirth]);

  const handleEdit = (field) => {
    setEditingField(field);
  };

  const handleSave = async (field) => {
    onUpdateUser({ ...user, [field]: formData?.[field] });
    try {
      const { updateUserProfile } = await import('../../../utils/db');
      await updateUserProfile(user.id, { [field]: formData?.[field] });
    } catch {}
    setEditingField(null);
  };

  const handleCancel = (field) => {
    setFormData({ ...formData, [field]: user?.[field] });
    setEditingField(null);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Delete account function
  const handleDeleteAccount = async () => {
    if (!user?.id) {
      alert('No user found to delete');
      return;
    }

    setIsDeleting(true);
    try {
      console.log('🗑️ Deleting user account:', user.id);

      // Delete from all Supabase tables (cascade should handle related data)
      // But we'll explicitly delete to be safe
      
      // 1. Delete achievements
      await supabase.from('achievements').delete().eq('user_id', user.id);
      console.log('✅ Deleted achievements');

      // 2. Delete exercises
      await supabase.from('exercises').delete().eq('user_id', user.id);
      console.log('✅ Deleted exercises');

      // 3. Delete food logs
      await supabase.from('food_logs').delete().eq('user_id', user.id);
      console.log('✅ Deleted food logs');

      // 4. Delete chatbot logs
      await supabase.from('chatbot_logs').delete().eq('user_id', user.id);
      console.log('✅ Deleted chatbot logs');

      // 5. Delete user stats
      await supabase.from('user_stats').delete().eq('user_id', user.id);
      console.log('✅ Deleted user stats');

      // 6. Delete user record
      const { error } = await supabase.from('users').delete().eq('id', user.id);
      if (error) {
        console.error('❌ Error deleting user:', error);
        throw error;
      }
      console.log('✅ Deleted user record');

      // Clear all local storage
      localStorage.removeItem('user');
      localStorage.removeItem('theme');
      localStorage.removeItem('fitcoach_badges');
      localStorage.removeItem('workoutAnalytics');
      localStorage.removeItem('fitcoach_today_plan');
      
      // Clear all achievement progress from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('achievement') || key.includes('pushup') || key.includes('plank'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear IndexedDB
      try {
        const { db } = await import('../../../utils/db');
        await db.delete();
        console.log('✅ Cleared IndexedDB');
      } catch (dbError) {
        console.warn('⚠️ Could not clear IndexedDB:', dbError);
      }

      alert('Account deleted successfully!');
      
      // Navigate to registration page
      navigate('/register-screen', { replace: true });

    } catch (error) {
      console.error('❌ Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const InfoField = ({ label, field, icon, type = "text" }) => {
    const isEditing = editingField === field;
    
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon name={icon} size={16} className="text-muted-foreground" />
            <label className="text-sm font-medium text-card-foreground">{label}</label>
          </div>
          
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(field)}
              className="text-primary hover:text-primary/80"
            >
              <Icon name="Edit2" size={14} />
            </Button>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-3">
            <Input
              type={type}
              value={formData?.[field]}
              onChange={(e) => handleChange(field, e?.target?.value)}
              className="w-full"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSave(field)}
                className="flex-1"
              >
                <Icon name="Check" size={14} className="mr-1" />
                {t('profile.save')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel(field)}
                className="flex-1"
              >
                <Icon name="X" size={14} className="mr-1" />
                {t('profile.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-foreground font-medium">
            {formData?.[field] || t('profile.notProvided')}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('profile.personalInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField
            label={t('profile.fullName')}
            field="name"
            icon="User"
          />
          <InfoField
            label={t('profile.email')}
            field="email"
            icon="Mail"
            type="email"
          />
          {/* Phone removed per request */}
          <InfoField
            label={t('profile.birthDate')}
            field="dateOfBirth"
            icon="Calendar"
            type="date"
          />
        </div>
      </div>

      {/* Location removed per request */}

      {/* Account Settings */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('profile.accountSettings')}</h3>
        <div className="space-y-3">
          {/* Theme Toggle in Profile Settings */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Sun" size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-card-foreground">{t('profile.appearance')}</p>
                  <p className="text-sm text-muted-foreground">{t('profile.appearanceCopy')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const isDark = document.documentElement.classList.contains('dark');
                    applyTheme(isDark ? 'light' : 'dark');
                  }}
                  className="inline-flex items-center rounded-[12px] border border-input px-3 py-2 text-sm hover:bg-muted"
                >
                  <Icon name="Moon" size={16} className="mr-2" />
                  {t('profile.toggleTheme')}
                </button>
              </div>
            </div>
          </div>
          {/* Privacy settings removed per request */}

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Bell" size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-card-foreground">Notification Preferences</p>
                  <p className="text-sm text-muted-foreground">Control your notification settings</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Trash2" size={20} className="text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account</p>
                </div>
              </div>
              {!showDeleteConfirm ? (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Icon name="Loader" size={14} className="mr-1 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Confirm Delete'
                    )}
                  </Button>
                </div>
              )}
            </div>
            {showDeleteConfirm && (
              <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Warning: This action cannot be undone!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  All your data including workouts, achievements, and progress will be permanently deleted.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
