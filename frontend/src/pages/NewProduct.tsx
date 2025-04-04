import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";



import { useState } from "react";

export default function NewProduct() {
    const [formData, setFormData] = useState({
        name: "",
        type: "",
        variety: "",
        info: "",
        price: "",
        order_index: "",
        subtype: "",
        package_size: "",
        package_type: "",
        price0: "",
        customer_group: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // handle submit logic here
        console.log("Product data:", formData);
        axios.post('/products', {
            name: formData.name,
            type: formData.type,
            variety: formData.variety,
            info: formData.info,
            price: formData.price,
            order_index: formData.order_index,
            subtype: formData.subtype,
            package_size: formData.package_size,
            package_type: formData.package_type,
            price0: formData.price0,
            customer_group: formData.customer_group
        })
    };

    return (
        <Card className="max-w-xl mx-auto mt-10 p-6">
            <CardContent>
                <h2 className="text-xl font-semibold mb-4">Uusi tuote</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="chain">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            maxLength={20}
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="name">Tyyppi *</Label>
                        <Input
                            id="type"
                            name="type"
                            required
                            value={formData.type}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="variety">Variety</Label>
                        <Input
                            id="variety"
                            name="variety"
                            value={formData.variety}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="price0">Price 0 %</Label>
                        <Input
                            id="price0"
                            name="price0"
                            value={formData.price0}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="pt-4">
                        <Button type="submit">Tallenna</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
