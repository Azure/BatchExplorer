import { CertificateCreateDto } from "app/models/dtos";

export type CertificateFormat = "pfx" | "cer";

export interface CreateCertificateModel {
    certificateFormat: CertificateFormat;
    data: string;
    password?: string;
    thumbprint: string;
    thumbprintAlgorithm: string;
}

export function createCertificateFormToJsonData(formData: CreateCertificateModel): CertificateCreateDto {
    const data: any = {
        certificateFormat: formData.certificateFormat,
        data: formData.data,
        password: formData.password,
        thumbprint: formData.thumbprint,
        thumbprintAlgorithm: formData.thumbprintAlgorithm,
    };
    return new CertificateCreateDto(data);
}

export function certificateToFormModel(certificate: CertificateCreateDto): CreateCertificateModel {
    return {
        certificateFormat: certificate.certificateFormat,
        data: certificate.data,
        password: certificate.password,
        thumbprint: certificate.thumbprint,
        thumbprintAlgorithm: certificate.thumbprintAlgorithm,
    };
}
