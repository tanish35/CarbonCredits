"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pinata_web3_1 = require("pinata-web3");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pinata = new pinata_web3_1.PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: "blue-glamorous-spider-989.mypinata.cloud",
});
function uploadToPinata(companyName, emissionAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const logoPath = path_1.default.resolve(__dirname, "../../public/certificate/companyLogo.jpeg");
            const logoFile = new File([fs_1.default.readFileSync(logoPath)], "companyLogo.jpeg", {
                type: "image/jpg",
            });
            const logoUpload = yield pinata.upload.file(logoFile);
            fs_1.default.unlinkSync(logoPath);
            // console.log("Logo CID:", logoUpload.IpfsHash);
            const metadata = {
                name: `Carbon Credit #2`,
                description: `This NFT represents ${emissionAmount} of CO2 offset.`,
                image: `ipfs://${logoUpload.IpfsHash}`,
                attributes: [
                    { trait_type: "Type", value: "Carbon Credit" },
                    { trait_type: "Amount", value: emissionAmount },
                    { trait_type: "Company Name", value: companyName },
                ],
            };
            const metadataFile = new File([JSON.stringify(metadata)], "metadata.json", {
                type: "application/json",
            });
            const metadataUpload = yield pinata.upload.file(metadataFile);
            // console.log("Metadata CID:", metadataUpload.IpfsHash);
            return metadataUpload.IpfsHash;
        }
        catch (error) {
            console.error("Error uploading to Pinata:", error);
            throw error;
        }
    });
}
exports.default = uploadToPinata;
