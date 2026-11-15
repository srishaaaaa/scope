import EnquirySection from '../components/EnquirySection';

// Dedicated enquiry page. The form is the existing EnquirySection (same API call, same validation and success handling).
export default function Enquiry() {
  return (
    <div className="s13-enq-page">
      <EnquirySection />
    </div>
  );
}
