import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
          <p className="text-muted-foreground mb-8">
            Have questions about your order or our products? We're here to help! 
            Reach out to us through any of the channels below.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-muted-foreground">+91 98765 43210</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">shrishyammart01@gmail.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">Location</p>
                <p className="text-muted-foreground">Society Commercial Complex, Shop No. 5</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/30 p-6 rounded-2xl border">
          <h3 className="text-xl font-semibold mb-4">Send us a Message</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" className="w-full p-2 border rounded-md" placeholder="Your Name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="w-full p-2 border rounded-md" placeholder="Your Email" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea className="w-full p-2 border rounded-md" rows={4} placeholder="How can we help?"></textarea>
            </div>
            <button type="button" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md font-medium">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
