import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MembersManagement from "@/components/admin/MembersManagement";
import LeadDetails, { Lead } from "@/components/admin/LeadDetails";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, 
  RefreshCw, 
  Settings, 
  BarChart, 
  PieChart, 
  Filter, 
  ChevronRight, 
  Eye,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  Bar,
  Line,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { supabase } from "@/lib/supabase";
import { getCurrentMember, isAdmin } from "@/lib/auth";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { addMonths, addYears, isAfter, format } from "date-fns";

interface Lead {
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
  // Additional fields that might not be displayed in the table
  goals?: string;
  notes?: string;
}

interface ColumnVisibility {
  phone: boolean;
  email: boolean;
  address: boolean;
  city: boolean;
  state: boolean;
  postalCode: boolean;
  leadSource: boolean;
  productType: boolean;
  createdBy: boolean;
  leadStatus: boolean;
  dateCreated: boolean;
  assignedTo: boolean;
  routingMethod: boolean;
  webhookStatus: boolean;
}

interface StatusCount {
  name: string;
  value: number;
  color: string;
}

interface TimeSeriesData {
  date: string;
  count: number;
}

const AdminPage: React.FC = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFrame, setTimeFrame] = useState<string>("day");
  const [timeRange, setTimeRange] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    phone: true,
    email: true,
    address: false, // Hide by default to make table more compact
    city: true,
    state: false, // Hide by default to make table more compact
    postalCode: false, // Hide by default to make table more compact
    leadSource: true,
    productType: true,
    createdBy: false, // Hide by default to make table more compact
    leadStatus: true,
    dateCreated: true,
    assignedTo: true,
    routingMethod: false, // Hide by default to make table more compact
    webhookStatus: true,
  });

  const member = getCurrentMember();
  
  if (!member) {
    return <Navigate to="/login" replace />;
  }

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('date_created', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setLeads(data);
        toast({
          title: "Leads Loaded",
          description: `Successfully loaded ${data.length} leads`,
        });
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Error Loading Leads",
        description: "There was an error loading the leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleRefresh = () => {
    fetchLeads();
  };

  const toggleColumnVisibility = (columnName: keyof ColumnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnName]: !prev[columnName]
    }));
  };

  const toggleAllColumns = (visible: boolean) => {
    setColumnVisibility({
      phone: visible,
      email: visible,
      address: visible,
      city: visible,
      state: visible,
      postalCode: visible,
      leadSource: visible,
      productType: visible,
      createdBy: visible,
      leadStatus: visible,
      dateCreated: visible,
      assignedTo: visible,
      routingMethod: visible,
      webhookStatus: visible,
    });
  };

  const filteredLeads = leads.filter(lead => {
    const leadName = `${lead.first_name} ${lead.last_name}`.toLowerCase();
    const matchesSearch = 
      leadName.includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.postal_code.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || lead.lead_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;

  const statusColors = {
    'New': '#3b82f6',
    'Contacted': '#f59e0b',
    'Qualified': '#10b981',
    'Proposal': '#8b5cf6',
    'Closed Won': '#059669',
    'Closed Lost': '#ef4444',
  };

  const statusCounts: StatusCount[] = leads.reduce((acc: StatusCount[], lead) => {
    const existingStatus = acc.find(item => item.name === lead.lead_status);
    
    if (existingStatus) {
      existingStatus.value += 1;
    } else {
      acc.push({
        name: lead.lead_status,
        value: 1,
        color: statusColors[lead.lead_status as keyof typeof statusColors] || '#94a3b8'
      });
    }
    
    return acc;
  }, []);

  const formatTimeFrameDate = (date: Date): string => {
    switch (timeFrame) {
      case 'day':
        return `${date.getMonth() + 1}/${date.getDate()}`;
      case 'week':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return `Week of ${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`;
      case 'month':
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
      default:
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const getTimeSeriesData = (): TimeSeriesData[] => {
    const dataMap = new Map<string, number>();
    
    // Filter leads based on selected time range
    const now = new Date();
    let filteredByTimeRange = [...leads];
    
    if (timeRange !== 'all') {
      let cutoffDate: Date;
      
      switch (timeRange) {
        case '3months':
          cutoffDate = addMonths(now, -3);
          break;
        case '6months':
          cutoffDate = addMonths(now, -6);
          break;
        case '1year':
          cutoffDate = addYears(now, -1);
          break;
        case '2years':
          cutoffDate = addYears(now, -2);
          break;
        default:
          cutoffDate = new Date(0); // Beginning of time
      }
      
      filteredByTimeRange = leads.filter(lead => 
        isAfter(new Date(lead.date_created), cutoffDate)
      );
    }
    
    const sortedLeads = [...filteredByTimeRange].sort((a, b) => 
      new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
    );
    
    sortedLeads.forEach(lead => {
      const date = new Date(lead.date_created);
      const formattedDate = formatTimeFrameDate(date);
      
      dataMap.set(formattedDate, (dataMap.get(formattedDate) || 0) + 1);
    });
    
    return Array.from(dataMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
  };

  const timeSeriesData = getTimeSeriesData();

  // Add function to calculate cumulative lead data
  const getCumulativeLeadsData = (): { date: string; count: number, cumulative: number }[] => {
    // Start with regular time series data
    const timeData = getTimeSeriesData();
    
    // Sort chronologically to ensure proper cumulative calculation
    const sortedData = [...timeData].sort((a, b) => {
      // Extract date parts for proper comparison
      const dateA = a.date.includes('Week of') 
        ? a.date.replace('Week of ', '')
        : a.date;
      const dateB = b.date.includes('Week of') 
        ? b.date.replace('Week of ', '')
        : b.date;
      
      const [monthA, dayOrYearA] = dateA.split('/');
      const [monthB, dayOrYearB] = dateB.split('/');
      
      // Handle different formats based on timeFrame
      if (timeFrame === 'month') {
        // For months, compare year then month
        const yearA = parseInt(dayOrYearA);
        const yearB = parseInt(dayOrYearB);
        if (yearA !== yearB) return yearA - yearB;
        return parseInt(monthA) - parseInt(monthB);
      } else {
        // For days or weeks, simple string comparison usually works
        return dateA.localeCompare(dateB);
      }
    });
    
    // Calculate cumulative values
    let cumulative = 0;
    return sortedData.map(item => {
      cumulative += item.count;
      return {
        ...item,
        cumulative
      };
    });
  };

  // Calculate the cumulative data
  const cumulativeData = getCumulativeLeadsData();

  // Function to handle row click
  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Add pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950 relative">
      <Navbar />
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage all lead entries and system users.
          </p>
        </div>

        <Tabs defaultValue="leads" className="mb-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="leads">Lead Management</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="leads">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>
                  View and manage all lead entries in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Search by name, email, phone, or address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Proposal">Proposal</SelectItem>
                        <SelectItem value="Closed Won">Closed Won</SelectItem>
                        <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full md:w-auto">
                        <Settings className="mr-2 h-4 w-4" />
                        Columns ({visibleColumnCount})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="p-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox 
                            id="selectAll"
                            checked={visibleColumnCount === Object.keys(columnVisibility).length}
                            onCheckedChange={(checked) => toggleAllColumns(checked === true)}
                          />
                          <label 
                            htmlFor="selectAll" 
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {visibleColumnCount === Object.keys(columnVisibility).length ? "Hide All" : "Show All"}
                          </label>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.phone}
                        onCheckedChange={() => toggleColumnVisibility('phone')}
                      >
                        Phone
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.email}
                        onCheckedChange={() => toggleColumnVisibility('email')}
                      >
                        Email
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.address}
                        onCheckedChange={() => toggleColumnVisibility('address')}
                      >
                        Address
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.city}
                        onCheckedChange={() => toggleColumnVisibility('city')}
                      >
                        City
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.state}
                        onCheckedChange={() => toggleColumnVisibility('state')}
                      >
                        State
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.postalCode}
                        onCheckedChange={() => toggleColumnVisibility('postalCode')}
                      >
                        Postal Code
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.leadSource}
                        onCheckedChange={() => toggleColumnVisibility('leadSource')}
                      >
                        Lead Source
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.productType}
                        onCheckedChange={() => toggleColumnVisibility('productType')}
                      >
                        Product Type
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.createdBy}
                        onCheckedChange={() => toggleColumnVisibility('createdBy')}
                      >
                        Created By
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.leadStatus}
                        onCheckedChange={() => toggleColumnVisibility('leadStatus')}
                      >
                        Lead Status
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.dateCreated}
                        onCheckedChange={() => toggleColumnVisibility('dateCreated')}
                      >
                        Date Created
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.assignedTo}
                        onCheckedChange={() => toggleColumnVisibility('assignedTo')}
                      >
                        Assigned To
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.routingMethod}
                        onCheckedChange={() => toggleColumnVisibility('routingMethod')}
                      >
                        Routing Method
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={columnVisibility.webhookStatus}
                        onCheckedChange={() => toggleColumnVisibility('webhookStatus')}
                      >
                        Webhook Sent
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button 
                    onClick={handleRefresh} 
                    disabled={isLoading}
                    className="w-full md:w-auto"
                  >
                    <RefreshCw 
                      className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} 
                    />
                    Refresh
                  </Button>
                </div>

                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableCaption>
                      {isLoading 
                        ? "Loading leads..."
                        : `Showing ${paginatedLeads.length} of ${filteredLeads.length} leads`
                      }
                    </TableCaption>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[200px]">Name</TableHead>
                        {columnVisibility.phone && <TableHead>Phone</TableHead>}
                        {columnVisibility.email && <TableHead>Email</TableHead>}
                        {columnVisibility.address && <TableHead>Address</TableHead>}
                        {columnVisibility.city && <TableHead>City</TableHead>}
                        {columnVisibility.state && <TableHead>State</TableHead>}
                        {columnVisibility.postalCode && <TableHead>Postal Code</TableHead>}
                        {columnVisibility.leadSource && <TableHead>Source</TableHead>}
                        {columnVisibility.productType && <TableHead>Product</TableHead>}
                        {columnVisibility.createdBy && <TableHead>Created By</TableHead>}
                        {columnVisibility.leadStatus && <TableHead>Status</TableHead>}
                        {columnVisibility.dateCreated && <TableHead>Date</TableHead>}
                        {columnVisibility.assignedTo && <TableHead>Assigned To</TableHead>}
                        {columnVisibility.routingMethod && <TableHead>Routing</TableHead>}
                        {columnVisibility.webhookStatus && <TableHead>Webhook</TableHead>}
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={visibleColumnCount + 2} className="text-center py-8">
                            <div className="flex justify-center items-center">
                              <RefreshCw className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
                              <span>Loading lead data...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={visibleColumnCount + 2} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center text-center">
                              <Filter className="h-8 w-8 mb-2 text-muted-foreground" />
                              <h3 className="font-semibold text-lg">No leads found</h3>
                              <p className="text-muted-foreground text-sm">
                                Try adjusting your search or filter to find what you're looking for.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedLeads.map((lead) => (
                          <TableRow 
                            key={lead.id} 
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleRowClick(lead)}
                          >
                            <TableCell className="font-medium">
                              {`${lead.first_name} ${lead.last_name}`}
                            </TableCell>
                            {columnVisibility.phone && <TableCell>{lead.phone}</TableCell>}
                            {columnVisibility.email && <TableCell>{lead.email}</TableCell>}
                            {columnVisibility.address && <TableCell>{lead.address}</TableCell>}
                            {columnVisibility.city && <TableCell>{lead.city}</TableCell>}
                            {columnVisibility.state && <TableCell>{lead.state}</TableCell>}
                            {columnVisibility.postalCode && <TableCell>{lead.postal_code}</TableCell>}
                            {columnVisibility.leadSource && (
                              <TableCell>{lead.lead_source}</TableCell>
                            )}
                            {columnVisibility.productType && (
                              <TableCell>{lead.product_type}</TableCell>
                            )}
                            {columnVisibility.createdBy && <TableCell>{lead.created_by}</TableCell>}
                            {columnVisibility.leadStatus && (
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block
                                  ${lead.lead_status === 'New' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                                  ${lead.lead_status === 'Contacted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                                  ${lead.lead_status === 'Qualified' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                                  ${lead.lead_status === 'Proposal' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : ''}
                                  ${lead.lead_status === 'Closed Won' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : ''}
                                  ${lead.lead_status === 'Closed Lost' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                                `}>
                                  {lead.lead_status}
                                </span>
                              </TableCell>
                            )}
                            {columnVisibility.dateCreated && (
                              <TableCell>{new Date(lead.date_created).toLocaleDateString()}</TableCell>
                            )}
                            {columnVisibility.assignedTo && (
                              <TableCell>{lead.assigned_to}</TableCell>
                            )}
                            {columnVisibility.routingMethod && (
                              <TableCell>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                  {lead.routing_method || 'None'}
                                </span>
                              </TableCell>
                            )}
                            {columnVisibility.webhookStatus && (
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  lead.webhook_sent
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {lead.webhook_sent ? 'Sent' : 'Failed'}
                                </span>
                              </TableCell>
                            )}
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click
                                  handleRowClick(lead);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Add pagination controls */}
                {filteredLeads.length > 0 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={handlePreviousPage} 
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {/* Generate page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Show first page, last page, current page, and pages around current
                          let pageNum: number | null = null;
                          
                          if (totalPages <= 5) {
                            // If 5 or fewer pages, show all page numbers
                            pageNum = i + 1;
                          } else if (i === 0) {
                            // First button is always page 1
                            pageNum = 1;
                          } else if (i === 4) {
                            // Last button is always the last page
                            pageNum = totalPages;
                          } else if (currentPage <= 2) {
                            // Near the start
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 1) {
                            // Near the end
                            pageNum = totalPages - 4 + i;
                          } else {
                            // In the middle
                            pageNum = currentPage - 1 + i;
                          }
                          
                          // Skip rendering if we need an ellipsis instead
                          if (
                            (pageNum > 2 && pageNum < currentPage - 1) || 
                            (pageNum > currentPage + 1 && pageNum < totalPages - 1)
                          ) {
                            if (i === 2) {
                              return (
                                <PaginationItem key={`ellipsis-${i}`}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            return null;
                          }
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                isActive={currentPage === pageNum}
                                onClick={() => handlePageChange(pageNum!)}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }).filter(Boolean)}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={handleNextPage} 
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            {isAdmin() ? (
              <MembersManagement />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Members Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">
                      You don't have permission to access this section. 
                      Only administrators can manage members.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Lead Status Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of leads by their current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={statusCounts}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusCounts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip 
                          formatter={(value, name) => [`${value} leads`, name]}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Leads Created Over Time
                  </CardTitle>
                  <CardDescription>
                    Number of new leads created by time period
                  </CardDescription>
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Button 
                        variant={timeFrame === 'day' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeFrame('day')}
                      >
                        Daily
                      </Button>
                      <Button 
                        variant={timeFrame === 'week' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeFrame('week')}
                      >
                        Weekly
                      </Button>
                      <Button 
                        variant={timeFrame === 'month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeFrame('month')}
                      >
                        Monthly
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant={timeRange === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('all')}
                      >
                        All Time
                      </Button>
                      <Button 
                        variant={timeRange === '3months' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('3months')}
                      >
                        Last 3 Months
                      </Button>
                      <Button 
                        variant={timeRange === '6months' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('6months')}
                      >
                        Last 6 Months
                      </Button>
                      <Button 
                        variant={timeRange === '1year' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('1year')}
                      >
                        Last Year
                      </Button>
                      <Button 
                        variant={timeRange === '2years' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('2years')}
                      >
                        Last 2 Years
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={timeSeriesData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis allowDecimals={false} />
                        <RechartsTooltip 
                          formatter={(value) => [`${value} leads`, 'Count']}
                        />
                        <Bar 
                          dataKey="count" 
                          name="Leads" 
                          fill="#3b82f6" 
                          radius={[4, 4, 0, 0]} 
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Add new Line Chart */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Lead Growth Trends
                  </CardTitle>
                  <CardDescription>
                    Cumulative lead growth over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={cumulativeData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          yAxisId="left"
                          orientation="left"
                          stroke="#8884d8"
                          allowDecimals={false}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          stroke="#82ca9d"
                          allowDecimals={false}
                        />
                        <RechartsTooltip 
                          formatter={(value, name) => {
                            if (name === "New Leads") return [`${value} leads`, name];
                            return [`${value} total leads`, name];
                          }}
                        />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="count"
                          name="New Leads"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone"
                          dataKey="cumulative"
                          name="Cumulative Total"
                          stroke="#82ca9d"
                          strokeWidth={2}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Lead details dialog */}
        <LeadDetails 
          lead={selectedLead} 
          open={detailsOpen} 
          onOpenChange={setDetailsOpen} 
        />
      </div>
    </div>
  );
};

export default AdminPage;
