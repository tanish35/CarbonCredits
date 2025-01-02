import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { parse } from "path";

interface NFTDetailsProps {
  id: string;
  typeofcredit: string;
  quantity: string;
  expiryDate: number;
  retired: boolean;
  certificateURI: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
}

const NFTDetailsPage: React.FC = () => {
  // const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const nftDetails = location.state as NFTDetailsProps;

  useEffect(() => {
    console.log(location);
  }, [location]);

  if (!nftDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to Wallet
      </Link>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{nftDetails.metadata.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img
                src={`https://${nftDetails.metadata.image.replace(/^ipfs:\/\//, "")}.ipfs.dweb.link/`}
                alt={nftDetails.metadata.name}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-4">
              <p className="text-lg">{nftDetails.metadata.description}</p>
              <div>
                <h3 className="text-xl font-semibold mb-2">Details</h3>
                <ul className="space-y-2">
                  <li>
                    <strong>ID:</strong> {parseInt(nftDetails.id).toString()}
                  </li>
                  <li>
                    <strong>Type of Credit:</strong> {nftDetails.typeofcredit}
                  </li>
                  <li>
                    <strong>Quantity:</strong>{" "}
                    {parseInt(nftDetails.quantity).toString()}
                  </li>
                  <li>
                    <strong>Expiry Date:</strong>{" "}
                    {new Date(
                      nftDetails.expiryDate * 1000
                    ).toLocaleDateString()}
                  </li>
                  {/* <li>
                    <strong>Status:</strong>{" "}
                    {nftDetails.retired ? (
                      <Badge variant="destructive">Retired</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </li> */}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Attributes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {nftDetails.metadata.attributes.map((attr, index) => (
                    <Badge key={index} variant="outline" className="p-2">
                      <span className="font-semibold">{attr.trait_type}:</span>{" "}
                      {attr.value}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => alert("Listing functionality not implemented")}
              >
                List for Sale
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTDetailsPage;
