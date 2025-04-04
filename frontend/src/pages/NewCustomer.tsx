import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";



import { useState } from "react";

export default function NewCustomerForm() {
    const [formData, setFormData] = useState({
        chain: "",
        name: "",
        additionalName: "",
        address: "",
        postalCode: "",
        city: "",
        reference: "",
        compensation: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // handle submit logic here
        console.log("Customer data:", formData);
    };

    return (
        <Card className="max-w-xl mx-auto mt-10 p-6">
            <CardContent>
                <h2 className="text-xl font-semibold mb-4">New Customer</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="chain">Chain (3 letters)</Label>
                        <Input
                            id="chain"
                            name="chain"
                            maxLength={3}
                            value={formData.chain}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="additionalName">Additional Name</Label>
                        <Input
                            id="additionalName"
                            name="additionalName"
                            value={formData.additionalName}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="reference">Reference</Label>
                        <Input
                            id="reference"
                            name="reference"
                            value={formData.reference}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="compensation">Compensation (optional)</Label>
                        <Input
                            id="compensation"
                            name="compensation"
                            type="number"
                            value={formData.compensation}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="pt-4">
                        <Button type="submit">Create Customer</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
