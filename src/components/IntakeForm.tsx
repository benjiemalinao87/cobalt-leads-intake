import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Confetti from "react-confetti";
import { 
  User, Phone, Mail, MapPin, Calendar, FileText, Home, Car, 
  BatteryCharging, HelpCircle, DollarSign, PenTool, Send,
  PartyPopper
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createLead } from "@/lib/sugarcrm";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  leadSource: string;
  productType: string;
  createdBy: string;
  leadStatus: string;
  dateCreated: string;
  assignedTo: string;
  avgElectricBill: string;
  avgKwhConsumption: string;
  hasEV: string;
  interestedInStorage: string;
  goals: string;
  notes: string;
  hasHOA: string;
  jobType: string;
  constructionType: string;
  installationType: string;
  roofType: string;
  primaryPhoneType: string;
  titleOfLead: string;
  floorCount: string;
  referralSource: string;
  hasPool: string;
  utilityProvider: string;
  hasBill: string;
  roofAge: string;
  roofCondition: string;
  roofShade: string;
  projectReadiness: string;
  referrals: string;
  financingMethod: string;
  preferredProducts: string;
}

const IntakeForm: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    leadSource: "",
    productType: "",
    createdBy: "Ty Whittaker",
    leadStatus: "New",
    dateCreated: new Date().toISOString(),
    assignedTo: "Ty Whittaker",
    avgElectricBill: "",
    avgKwhConsumption: "",
    hasEV: "",
    interestedInStorage: "",
    goals: "",
    notes: "",
    hasHOA: "",
    jobType: "",
    constructionType: "",
    installationType: "",
    roofType: "",
    primaryPhoneType: "",
    titleOfLead: "",
    floorCount: "",
    referralSource: "",
    hasPool: "",
    utilityProvider: "",
    hasBill: "",
    roofAge: "",
    roofCondition: "",
    roofShade: "",
    projectReadiness: "",
    referrals: "",
    financingMethod: "",
    preferredProducts: "",
  });

  const initialAutoFields = {
    createdBy: formData.createdBy,
    leadStatus: formData.leadStatus,
    dateCreated: formData.dateCreated,
    assignedTo: formData.assignedTo,
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [windowDimension, setWindowDimension] = useState<{width: number, height: number}>({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prevData) => ({
        ...prevData,
        [name]: formattedPhone,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const formatPhoneNumber = (value: string): string => {
    const phoneDigits = value.replace(/\D/g, "");
    if (phoneDigits.length === 0) return "";
    if (phoneDigits.length > 0 && !value.includes("+1")) {
      if (phoneDigits.length >= 10) {
        return `+1${phoneDigits.slice(0, 10)}`;
      }
      return `+1${phoneDigits}`;
    }
    if (value.includes("+1")) {
      const digits = value.replace(/\D/g, "");
      return `+1${digits.slice(1, 11)}`;
    }
    return value;
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isRequired = (fieldName: string): boolean => {
    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "address",
      "city",
      "state",
      "zip",
      "leadSource",
      "productType",
    ];
    return requiredFields.includes(fieldName);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      leadSource: "",
      productType: "",
      createdBy: initialAutoFields.createdBy,
      leadStatus: initialAutoFields.leadStatus,
      dateCreated: initialAutoFields.dateCreated,
      assignedTo: initialAutoFields.assignedTo,
      avgElectricBill: "",
      avgKwhConsumption: "",
      hasEV: "",
      interestedInStorage: "",
      goals: "",
      notes: "",
      hasHOA: "",
      jobType: "",
      constructionType: "",
      installationType: "",
      roofType: "",
      primaryPhoneType: "",
      titleOfLead: "",
      floorCount: "",
      referralSource: "",
      hasPool: "",
      utilityProvider: "",
      hasBill: "",
      roofAge: "",
      roofCondition: "",
      roofShade: "",
      projectReadiness: "",
      referrals: "",
      financingMethod: "",
      preferredProducts: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const leadData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.zip,
        lead_source: formData.leadSource,
        product_type: formData.productType,
        created_by: formData.createdBy,
        lead_status: formData.leadStatus,
        date_created: formData.dateCreated,
        assigned_to: formData.assignedTo,
        api_sent: false,
        avg_electric_bill: formData.avgElectricBill,
        avg_kwh_consumption: formData.avgKwhConsumption,
        has_ev: formData.hasEV,
        interested_in_storage: formData.interestedInStorage,
        goals: formData.goals,
        notes: formData.notes,
        has_hoa: formData.hasHOA,
        job_type: formData.jobType,
        construction_type: formData.constructionType,
        installation_type: formData.installationType,
        roof_type: formData.roofType,
        primary_phone_type: formData.primaryPhoneType,
        title_of_lead: formData.titleOfLead,
        floor_count: formData.floorCount,
        referral_source: formData.referralSource,
        has_pool: formData.hasPool,
        utility_provider: formData.utilityProvider,
        has_bill: formData.hasBill,
        roof_age: formData.roofAge,
        roof_condition: formData.roofCondition,
        roof_shade: formData.roofShade,
        project_readiness: formData.projectReadiness,
        referrals: formData.referrals,
        financing_method: formData.financingMethod,
        preferred_products: formData.preferredProducts,
        form_data: formData
      };

      const { data: savedLead, error: supabaseError } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();

      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        throw new Error("Failed to save lead to database");
      }

      let sugarCrmResponse = null;
      let sugarCrmError = null;
      try {
        sugarCrmResponse = await createLead(formData);
        
        await supabase
          .from('leads')
          .update({ 
            api_sent: true,
            api_response_id: sugarCrmResponse?.id || null,
            api_response_data: sugarCrmResponse
          })
          .eq('id', savedLead.id);
          
        console.log("Successfully sent lead to SugarCRM:", sugarCrmResponse);
      } catch (error) {
        console.error("SugarCRM API error:", error);
        sugarCrmError = error;
        
        await supabase
          .from('leads')
          .update({ 
            api_sent: false,
            api_response_data: { 
              error: "Failed to create lead in SugarCRM",
              details: error instanceof Error ? error.message : String(error)
            }
          })
          .eq('id', savedLead.id);
      }

      const webhookResponse = await fetch("https://hkdk.events/peoqe7iqzgcxeh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (webhookResponse.ok) {
        await supabase
          .from('leads')
          .update({ webhook_sent: true })
          .eq('id', savedLead.id);
        
        console.log("Successfully sent lead to webhook");
      } else {
        console.error("Webhook error:", webhookResponse.status, webhookResponse.statusText);
        
        await supabase
          .from('leads')
          .update({ 
            webhook_sent: false,
            webhook_error: `${webhookResponse.status}: ${webhookResponse.statusText}`
          })
          .eq('id', savedLead.id);
      }

      if (webhookResponse.ok || sugarCrmResponse) {
        toast({
          title: "Form Submitted Successfully",
          description: "Your intake form has been submitted.",
          variant: "default",
        });
        
        setShowConfetti(true);
        
        resetForm();
      } else {
        throw new Error("Failed to submit form to external systems");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const leadSourceOptions = [
    "Website",
    "Referral",
    "Phone Call",
    "Walk-in",
    "Event",
    "Social Media",
    "Other",
  ];

  const productTypeOptions = [
    "Solar Panels",
    "Solar Roof",
    "Powerwall",
    "Solar Panel + Powerwall",
    "Solar Roof + Powerwall",
    "Other",
  ];

  const jobTypeOptions = [
    "Residential",
    "Commercial",
    "Industrial",
    "Other",
  ];

  const constructionTypeOptions = [
    "New Construction",
    "Retrofit",
    "Addition",
    "Other",
  ];

  const titleOptions = [
    "Mr.",
    "Mrs.",
    "Ms.",
    "Dr.",
    "Prof.",
    "Other",
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      {showConfetti && (
        <Confetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      <div className="tesla-form-container bg-white/95 backdrop-blur-sm p-6 md:p-8 rounded-xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white/90">
            Cobalt Power Solar Intake Form
          </h1>
          <div className="w-40 h-20">
            <img 
              src="https://www.cobaltpower.com/images/logos/Transparent-Logo.2212160539550.png" 
              alt="Cobalt Power Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Required Personal Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="section-title flex items-center">
              <User className="h-5 w-5 mr-2 text-tesla-blue-500" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="tesla-label">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="tesla-input w-full"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="tesla-label">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="tesla-input w-full"
                  placeholder="Last Name"
                />
              </div>
              <div>
                <label htmlFor="titleOfLead" className="tesla-label">
                  Title
                </label>
                <select
                  id="titleOfLead"
                  name="titleOfLead"
                  value={formData.titleOfLead}
                  onChange={handleChange}
                  className="tesla-select w-full"
                >
                  <option value="">Select Title</option>
                  {titleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="primaryPhoneType" className="tesla-label">
                  Primary Phone Type
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="primaryPhoneType"
                      value="Mobile"
                      checked={formData.primaryPhoneType === "Mobile"}
                      onChange={() => handleRadioChange("primaryPhoneType", "Mobile")}
                      className="tesla-radio mr-2"
                    />
                    Mobile
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="primaryPhoneType"
                      value="Office"
                      checked={formData.primaryPhoneType === "Office"}
                      onChange={() => handleRadioChange("primaryPhoneType", "Office")}
                      className="tesla-radio mr-2"
                    />
                    Office
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="primaryPhoneType"
                      value="Home"
                      checked={formData.primaryPhoneType === "Home"}
                      onChange={() => handleRadioChange("primaryPhoneType", "Home")}
                      className="tesla-radio mr-2"
                    />
                    Home
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="section-title flex items-center">
              <Phone className="h-5 w-5 mr-2 text-tesla-blue-500" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="tesla-label">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="tesla-input w-full"
                  placeholder="+1 (xxx) xxx-xxxx"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  US format with country code (+1) will be applied automatically
                </p>
              </div>
              <div>
                <label htmlFor="email" className="tesla-label">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="tesla-input w-full"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="section-title flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-tesla-blue-500" />
              Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address" className="tesla-label">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="tesla-input w-full"
                  placeholder="Street Address"
                />
              </div>
              <div>
                <label htmlFor="city" className="tesla-label">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="tesla-input w-full"
                  placeholder="City"
                />
              </div>
              <div>
                <label htmlFor="state" className="tesla-label">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="tesla-input w-full"
                  placeholder="State"
                />
              </div>
              <div>
                <label htmlFor="zip" className="tesla-label">
                  Zip <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  required
                  className="tesla-input w-full"
                  placeholder="Zip Code"
                />
              </div>
              <div>
                <label htmlFor="floorCount" className="tesla-label">
                  How many floors is your home?
                </label>
                <input
                  type="number"
                  id="floorCount"
                  name="floorCount"
                  value={formData.floorCount}
                  onChange={handleChange}
                  className="tesla-input w-full"
                  placeholder="Number of floors"
                  min="1"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="hasHOA"
                  checked={formData.hasHOA === "YES"}
                  onChange={(e) => handleRadioChange("hasHOA", e.target.checked ? "YES" : "NO")}
                  className="tesla-checkbox mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Property has HOA?</span>
              </label>
            </div>
          </div>

          {/* Lead Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="section-title flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-tesla-blue-500" />
              Lead Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="leadSource" className="tesla-label">
                  Lead Source <span className="text-red-500">*</span>
                </label>
                <select
                  id="leadSource"
                  name="leadSource"
                  value={formData.leadSource}
                  onChange={handleChange}
                  required
                  className="tesla-select w-full"
                >
                  <option value="">Select Lead Source</option>
                  {leadSourceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="productType" className="tesla-label">
                  Product Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="productType"
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  required
                  className="tesla-select w-full"
                >
                  <option value="">Select Product Type</option>
                  {productTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="jobType" className="tesla-label">
                  Job Type
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="tesla-select w-full"
                >
                  <option value="">Select Job Type</option>
                  {jobTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="constructionType" className="tesla-label">
                  Construction Type
                </label>
                <select
                  id="constructionType"
                  name="constructionType"
                  value={formData.constructionType}
                  onChange={handleChange}
                  className="tesla-select w-full"
                >
                  <option value="">Select Construction Type</option>
                  {constructionTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="referralSource" className="tesla-label">
                  Where did you hear about us?
                </label>
                <input
                  type="text"
                  id="referralSource"
                  name="referralSource"
                  value={formData.referralSource}
                  onChange={handleChange}
                  className="tesla-input w-full"
                  placeholder="Referral source"
                />
              </div>
              <div>
                <label htmlFor="referrals" className="tesla-label">
                  Do you know anyone else that would be interested? (Referral)
                </label>
                <input
                  type="text"
                  id="referrals"
                  name="referrals"
                  value={formData.referrals}
                  onChange={handleChange}
                  className="tesla-input w-full"
                  placeholder="Referrals"
                />
              </div>
            </div>

            {/* Auto-generated fields (displayed as readonly) */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="createdBy" className="tesla-label">
                  Created By
                </label>
                <input
                  type="text"
                  id="createdBy"
                  name="createdBy"
                  value={formData.createdBy}
                  readOnly
                  className="tesla-input w-full bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="leadStatus" className="tesla-label">
                  Lead Status
                </label>
                <input
                  type="text"
                  id="leadStatus"
                  name="leadStatus"
                  value={formData.leadStatus}
                  readOnly
                  className="tesla-input w-full bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="dateCreated" className="tesla-label">
                  Date Created
                </label>
                <input
                  type="text"
                  id="dateCreated"
                  name="dateCreated"
                  value={new Date(formData.dateCreated).toLocaleString()}
                  readOnly
                  className="tesla-input w-full bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="assignedTo" className="tesla-label">
                  Assigned To
                </label>
                <input
                  type="text"
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  readOnly
                  className="tesla-input w-full bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Energy Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="section-title flex items-center">
              <FileText className="h-5 w-5 mr-2 text-tesla-blue-500" />
              Energy Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="avgElectricBill" className="tesla-label">
                  Average Electric Bill ($)
                </label>
                <input
                  type="text"
                  id="avgElectricBill"
                  name="avgElectricBill"
                  value={formData.avgElectricBill}
                  onChange={handleChange}
                  className="tesla-input w-full"
                  placeholder="$"
                />
              </div>
              <div>
                <label htmlFor="avgKwhConsumption" className="tesla-label">
                  Average kWh Consumption
                </label>
                <input
                  type="text"
                  id="avgKwhConsumption"
                  name="avgKwhConsumption"
                  value={formData.avgKwhConsumption}
                  onChange={handleChange}
                  className="tesla-input w-full"
                  placeholder="kWh"
                />
              </div>
              <div>
                <label htmlFor="utilityProvider" className="tesla-label">
                  Utility Provider
                </label>
                <input
                  type="text"
                  id="utilityProvider"
                  name="utilityProvider"
                  value={formData.utilityProvider}
                  onChange={handleChange}
                  className="tesla-input w-full"
                  placeholder="Utility Provider"
                />
              </div>
              <div className="flex flex-col">
                <span className="tesla-label">Copy of electric bill?</span>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasBill"
                      value="YES"
                      checked={formData.hasBill === "YES"}
                      onChange={() => handleRadioChange("hasBill", "YES")}
                      className="tesla-radio mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasBill"
                      value="NO"
                      checked={formData.hasBill === "NO"}
                      onChange={() => handleRadioChange("hasBill", "NO")}
                      className="tesla-radio mr-2"
                    />
                    No
                  </label>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="tesla-label mb-2">Have/want an EV?</span>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasEV"
                      value="YES"
                      checked={formData.hasEV === "YES"}
                      onChange={() => handleRadioChange("hasEV", "YES")}
                      className="tesla-radio mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasEV"
                      value="NO"
                      checked={formData.hasEV === "NO"}
                      onChange={() => handleRadioChange("hasEV", "NO")}
                      className="tesla-radio mr-2"
                    />
                    No
                  </label>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="tesla-label mb-2">Interested in storage?</span>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="interestedInStorage"
                      value="YES"
                      checked={formData.interestedInStorage === "YES"}
                      onChange={() => handleRadioChange("interestedInStorage", "YES")}
                      className="tesla-radio mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="interestedInStorage"
                      value="NO"
                      checked={formData.interestedInStorage === "NO"}
                      onChange={() => handleRadioChange("interestedInStorage", "NO")}
                      className="tesla-radio mr-2"
                    />
                    No
                  </label>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="tesla-label mb-2">Do you have a swimming pool or hot tub?</span>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasPool"
                      value="YES"
                      checked={formData.hasPool === "YES"}
                      onChange={() => handleRadioChange("hasPool", "YES")}
                      className="tesla-radio mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasPool"
                      value="NO"
                      checked={formData.hasPool === "NO"}
                      onChange={() => handleRadioChange("hasPool", "NO")}
                      className="tesla-radio mr-2"
                    />
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Roof Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="section-title flex items-center">
              <Home className="h-5 w-5 mr-2 text-tesla-blue-500" />
              Roof Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="roofType" className="tesla-label">
                  Roof Type
                </label>
                <input
                  type="text"
                  id="roofType"
                  name="roofType"
                  value={formData.roofType}
                  onChange={handleChange}
                  className="tesla-input w-full"
                  placeholder="Roof Type"
                />
              </div>
              <div>
                <label htmlFor="roofAge" className="tesla-label">
                  How old is your roof?
                </label>
                <input
                  type="text"
                  id="roofAge"
                  name="roofAge"
                  value={formData.roofAge}
                  onChange={handleChange}
                  className="tesla-input w-full"
                  placeholder="Roof Age"
                />
              </div>
              <div>
                <label htmlFor="roofCondition" className="tesla-label">
                  What condition would you say your roof is in?
                </label>
                <input
                  type="text"
                  id="roofCondition"
                  name="roofCondition"
                  value={formData.roofCondition}
                  onChange={handleChange}
                  className="tesla-input w-full"
                  placeholder="Roof Condition"
                />
              </div>
              <div className="flex flex-col">
                <span className="tesla-label mb-2">How much shade is on your roof?</span>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="roofShade"
                      value="Low"
                      checked={formData.roofShade === "Low"}
                      onChange={() => handleRadioChange("roofShade", "Low")}
                      className="tesla-radio mr-2"
                    />
                    Low
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="roofShade"
                      value="Medium"
                      checked={formData.roofShade === "Medium"}
                      onChange={() => handleRadioChange("roofShade", "Medium")}
                      className="tesla-radio mr-2"
                    />
                    Medium
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="roofShade"
                      value="High"
                      checked={formData.roofShade === "High"}
                      onChange={() => handleRadioChange("roofShade", "High")}
                      className="tesla-radio mr-2"
                    />
                    High
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="section-title flex items-center">
              <PenTool className="h-5 w-5 mr-2 text-tesla-blue-500" />
              Project Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="installationType" className="tesla-label">
                  Installation Type
                </label>
                <input
                  type="text"
                  id="installationType"
                  name="installationType"
                  value={formData.installationType}
                  onChange={handleChange}
                  className="tesla-input w-full"
                  placeholder="Installation Type"
                />
              </div>
              <div>
                <label htmlFor="projectReadiness" className="tesla-label">
                  When will you be ready to start this project?
                </label>
                <input
                  type="text"
                  id="projectReadiness"
                  name="projectReadiness"
                  value={formData.projectReadiness}
                  onChange={handleChange}
                  className="tesla-input w-full"
                  placeholder="Project Timeline"
                />
              </div>
              <div className="flex flex-col">
                <span className="tesla-label mb-2">How are you wanting to finance this project?</span>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="financingMethod"
                      value="Cash"
                      checked={formData.financingMethod === "Cash"}
                      onChange={() => handleRadioChange("financingMethod", "Cash")}
                      className="tesla-radio mr-2"
                    />
                    Cash
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="financingMethod"
                      value="Loan"
                      checked={formData.financingMethod === "Loan"}
                      onChange={() => handleRadioChange("financingMethod", "Loan")}
                      className="tesla-radio mr-2"
                    />
                    Loan
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="preferredProducts" className="tesla-label">
                  Are there particular products or manufacturers you'd like to discuss?
                </label>
                <input
                  type="text"
                  id="preferredProducts"
                  name="preferredProducts"
                  value={formData.preferredProducts}
                  onChange={handleChange}
                  className="tesla-input w-full"
                  placeholder="Preferred Products"
                />
              </div>
            </div>
          </div>

          {/* Goals and Notes */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="section-title flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-tesla-blue-500" />
              Goals and Notes
            </h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="goals" className="tesla-label">
                  Goals
                </label>
                <textarea
                  id="goals"
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  className="tesla-input w-full h-24 resize-none"
                  placeholder="What are your goals for this project?"
                ></textarea>
              </div>
              <div>
                <label htmlFor="notes" className="tesla-label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="tesla-input w-full h-24 resize-none"
                  placeholder="Additional notes or comments"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="tesla-btn w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Submit Intake Form
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IntakeForm;
