
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Globe, Users } from "lucide-react";

export type ChatPreferences = {
  gender: string;
  country: string;
};

interface ChatPreferencesProps {
  onPreferencesChange: (preferences: ChatPreferences) => void;
  disabled?: boolean;
}

export const genderOptions = [
  { value: "any", label: "Any Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" }
];

export const countryOptions = [
  { value: "any", label: "Any Country" },
  { value: "us", label: "United States" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "jp", label: "Japan" },
  { value: "cn", label: "China" },
  { value: "in", label: "India" },
  { value: "es", label: "Spain" },
  { value: "mx", label: "Mexico" }
];

const ChatPreferences: React.FC<ChatPreferencesProps> = ({ onPreferencesChange, disabled = false }) => {
  const form = useForm<ChatPreferences>({
    defaultValues: {
      gender: "any",
      country: "any"
    }
  });

  const handleFormChange = (values: ChatPreferences) => {
    onPreferencesChange(values);
  };

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(handleFormChange)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Gender Preference
                </FormLabel>
                <FormControl>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Country Preference
                </FormLabel>
                <FormControl>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};

export default ChatPreferences;
