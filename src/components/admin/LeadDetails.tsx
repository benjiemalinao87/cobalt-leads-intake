import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { User, Phone, Mail, MapPin, Calendar, Tag, Activity } from "lucide-react";

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  lead_source: string;
  product_type: string;
  created_by: string;
  lead_status: string;
  date_created: string;
  assigned_to: string;
  assigned_sales_rep_id: string | null;
  webhook_sent: boolean;
  routing_method: string;
  created_at: string;
  goals?: string;
  notes?: string;
}

interface LeadDetailsProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LeadDetails: React.FC<LeadDetailsProps> = ({ 
  lead, 
  open, 
  onOpenChange 
}) => {
  if (!lead) return null;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-100 text-blue-800";
      case "Contacted": return "bg-yellow-100 text-yellow-800";
      case "Qualified": return "bg-green-100 text-green-800";
      case "Proposal": return "bg-purple-100 text-purple-800";
      case "Closed Won": return "bg-emerald-100 text-emerald-800";
      case "Closed Lost": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{`${lead.first_name} ${lead.last_name}`}</span>
            <Badge variant="outline" className={`ml-2 ${getStatusColor(lead.lead_status)}`}>
              {lead.lead_status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Lead created {formatDistanceToNow(new Date(lead.date_created), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Information</h3>
              <Separator className="my-2" />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{lead.email}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <div>{lead.address}</div>
                    <div>{`${lead.city}, ${lead.state} ${lead.postal_code}`}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lead Details</h3>
              <Separator className="my-2" />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Created: {formatDate(lead.date_created)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span>Source: {lead.lead_source}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <span>Product: {lead.product_type}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assignment Information</h3>
              <Separator className="my-2" />
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500">Assigned To:</span>
                  <div className="font-medium">{lead.assigned_to || "Unassigned"}</div>
                </div>
                <div>
                  <span className="text-gray-500">Routing Method:</span>
                  <div className="font-medium">{lead.routing_method || "None"}</div>
                </div>
                <div>
                  <span className="text-gray-500">Created By:</span>
                  <div className="font-medium">{lead.created_by}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Integration Status</h3>
              <Separator className="my-2" />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={lead.webhook_sent ? "success" : "destructive"}>
                    Webhook: {lead.webhook_sent ? "Sent" : "Failed"}
                  </Badge>
                </div>
              </div>
            </div>
            
            {(lead.goals || lead.notes) && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Additional Information</h3>
                <Separator className="my-2" />
                {lead.goals && (
                  <div className="mb-2">
                    <span className="text-gray-500">Goals:</span>
                    <p className="text-sm mt-1">{lead.goals}</p>
                  </div>
                )}
                {lead.notes && (
                  <div>
                    <span className="text-gray-500">Notes:</span>
                    <p className="text-sm mt-1">{lead.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetails; 