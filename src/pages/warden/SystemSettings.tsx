import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wardenApi } from '@/services/api-services';
import { SystemSettingResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Settings, Clock, Save, Info } from 'lucide-react';
import { format } from 'date-fns';

const SystemSettings = () => {
  const [cutoffTime, setCutoffTime] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentCutoffTime, isLoading: loadingCutoffTime } = useQuery({
    queryKey: ['cutoff-time'],
    queryFn: async () => {
      const response = await wardenApi.getCutoffTime();
      const time = response.data.data;
      setCutoffTime(time);
      return time;
    }
  });

  const { data: allSettings, isLoading: loadingSettings } = useQuery({
    queryKey: ['all-settings'],
    queryFn: async () => {
      const response = await wardenApi.getAllSettings();
      return response.data.data || [];
    }
  });

  const updateCutoffMutation = useMutation({
    mutationFn: (time: string) => wardenApi.updateCutoffTime(time),
    onSuccess: () => {
      toast({ title: "Success", description: "Cutoff time updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['cutoff-time'] });
      queryClient.invalidateQueries({ queryKey: ['all-settings'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update cutoff time", variant: "destructive" });
    }
  });

  const handleUpdateCutoffTime = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cutoffTime) {
      toast({ title: "Error", description: "Please select a cutoff time", variant: "destructive" });
      return;
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(cutoffTime)) {
      toast({ title: "Error", description: "Please enter a valid time in HH:mm format", variant: "destructive" });
      return;
    }

    updateCutoffMutation.mutate(cutoffTime);
  };

  if (loadingCutoffTime || loadingSettings) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Absence Request Cutoff Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateCutoffTime} className="space-y-4">
              <div>
                <Label htmlFor="cutoff-time">Cutoff Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="cutoff-time"
                    type="time"
                    value={cutoffTime}
                    onChange={(e) => setCutoffTime(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current cutoff time: {currentCutoffTime || 'Not set'}
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={updateCutoffMutation.isPending}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateCutoffMutation.isPending ? 'Updating...' : 'Update Cutoff Time'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              How Cutoff Time Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">1</div>
                <p>Absence requests submitted <strong>before</strong> cutoff time are categorized as "Early"</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">2</div>
                <p>Absence requests submitted <strong>after</strong> cutoff time are categorized as "Late"</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">3</div>
                <p><strong>Monitors</strong> can approve early requests</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">4</div>
                <p><strong>Wardens</strong> can approve late requests</p>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Example:</p>
              <p className="text-sm text-muted-foreground">
                If cutoff time is set to 11:00 AM, requests submitted at 10:30 AM will be handled by monitors, 
                while requests submitted at 11:30 AM will require warden approval.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allSettings?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No settings configured</p>
            ) : (
              allSettings?.map((setting: SystemSettingResponse) => (
                <div key={setting.settingId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{setting.settingKey.replace(/_/g, ' ')}</h3>
                    <span className="text-sm text-muted-foreground">
                      Updated: {format(new Date(setting.updatedAt), 'PPp')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{setting.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {setting.settingValue}
                    </span>
                    {setting.updatedBy && (
                      <span className="text-xs text-muted-foreground">
                        by {setting.updatedBy}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;