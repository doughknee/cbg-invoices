import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" updatedOn="May 6, 2026">
      <p>
        Cambridge Building Group operates the Cambridge Invoice Portal for internal accounts
        payable workflows. This Privacy Policy explains what information the portal collects,
        how it is used, and who to contact with privacy questions.
      </p>

      <h2>Operator</h2>
      <p>
        Cambridge Building Group<br />
        717 Newhall Dr<br />
        Nashville, TN 37206<br />
        support@cambridgebg.com
      </p>

      <h2>Information We Collect</h2>
      <p>The portal may collect and store:</p>
      <ul>
        <li>user profile information such as name, email address, and role,</li>
        <li>vendor invoice emails, attachments, and uploaded PDF documents,</li>
        <li>invoice metadata such as vendor name, invoice number, due date, totals, and notes,</li>
        <li>approval, assignment, rejection, and audit-log activity within the portal,</li>
        <li>QuickBooks Online connection metadata and synchronized accounting records, and</li>
        <li>technical logs needed to secure, operate, and troubleshoot the service.</li>
      </ul>

      <h2>How We Use Information</h2>
      <p>Cambridge Building Group uses this information to:</p>
      <ul>
        <li>receive and review vendor invoices,</li>
        <li>extract invoice details from email bodies and PDF documents,</li>
        <li>route invoices for internal approval and coding,</li>
        <li>post approved bills to QuickBooks Online,</li>
        <li>synchronize supporting accounting data such as vendors and projects, and</li>
        <li>maintain security, fraud prevention, and auditability of the workflow.</li>
      </ul>

      <h2>QuickBooks Online Data</h2>
      <p>
        If QuickBooks Online is connected, the portal uses Intuit APIs to authenticate the
        customer account, synchronize approved reference data, and create bills approved by
        authorized Cambridge users. QuickBooks data is used only for operating the invoice
        workflow requested by the customer.
      </p>

      <h2>Service Providers</h2>
      <p>
        The portal relies on third-party providers to operate. Depending on configuration,
        those providers may include Intuit QuickBooks Online, Logto for authentication, email
        delivery or inbound processing providers, cloud file storage providers, and AI vendors
        used to extract invoice fields from submitted documents. These providers process data
        only to deliver services to Cambridge Building Group.
      </p>

      <h2>Sharing of Information</h2>
      <p>
        Cambridge Building Group does not sell personal information collected through the
        portal. Information is shared only with authorized users, contracted service providers,
        or when required for legal compliance, security response, or protection of Cambridge
        Building Group’s rights.
      </p>

      <h2>Retention</h2>
      <p>
        Information is retained for as long as needed to operate the invoice workflow,
        maintain business records, satisfy accounting obligations, and support security or
        audit requirements.
      </p>

      <h2>Security</h2>
      <p>
        Cambridge Building Group uses reasonable administrative, technical, and organizational
        measures to protect portal data. No internet-based system can be guaranteed perfectly
        secure, so users should submit information only through approved workflows and protect
        their credentials.
      </p>

      <h2>Your Choices</h2>
      <p>
        Access to the portal is controlled by invitation. Users who need account changes,
        corrections, or removal requests should contact Cambridge Building Group at
        support@cambridgebg.com.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this Privacy Policy or portal privacy practices may be sent to
        support@cambridgebg.com.
      </p>
    </LegalLayout>
  );
}
