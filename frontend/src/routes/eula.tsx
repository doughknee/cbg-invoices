import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const Route = createFileRoute("/eula")({
  component: EulaPage,
});

function EulaPage() {
  return (
    <LegalLayout title="End User License Agreement" updatedOn="May 6, 2026">
      <p>
        This End User License Agreement governs access to and use of the Cambridge Invoice
        Portal. By using the portal, you agree to these terms on behalf of yourself and, if
        applicable, the organization that authorized your access.
      </p>

      <h2>Provider</h2>
      <p>
        Cambridge Building Group<br />
        717 Newhall Dr<br />
        Nashville, TN 37206<br />
        support@cambridgebg.com
      </p>

      <h2>License Grant</h2>
      <p>
        Cambridge Building Group grants invited users a limited, revocable, non-exclusive,
        non-transferable license to access and use the portal solely for legitimate business
        purposes related to invoice intake, review, approval, and accounting operations.
      </p>

      <h2>Restrictions</h2>
      <p>You may not:</p>
      <ul>
        <li>copy, resell, sublicense, or redistribute the portal,</li>
        <li>attempt to reverse engineer, disrupt, or bypass portal security controls,</li>
        <li>use the portal for unlawful, fraudulent, or unauthorized purposes, or</li>
        <li>share access credentials with unauthorized users.</li>
      </ul>

      <h2>User Responsibilities</h2>
      <p>Users are responsible for:</p>
      <ul>
        <li>maintaining the confidentiality of their credentials,</li>
        <li>ensuring submitted invoice information is business-appropriate,</li>
        <li>reviewing extracted data before approval or posting, and</li>
        <li>using QuickBooks connections and accounting actions only when authorized.</li>
      </ul>

      <h2>QuickBooks Online Integration</h2>
      <p>
        The portal may connect to QuickBooks Online to synchronize vendors, projects, and
        related accounting data, and to create bills approved by authorized users. Users must
        ensure they have authority to connect and operate the relevant QuickBooks company.
      </p>

      <h2>Data and Records</h2>
      <p>
        Invoice submissions, audit logs, approvals, and related records generated through the
        portal may be retained as part of Cambridge Building Group’s business systems. Privacy
        and data-handling details are described in the Privacy Policy.
      </p>

      <h2>Availability and Changes</h2>
      <p>
        The portal is provided on an internal-business-use basis. Cambridge Building Group may
        modify, suspend, or discontinue features at any time, including integrations,
        extraction behavior, and workflow controls.
      </p>

      <h2>Termination</h2>
      <p>
        Cambridge Building Group may suspend or terminate access at any time for security,
        policy, operational, or employment-related reasons. Upon termination, the user’s right
        to use the portal ends immediately.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The portal is provided on an “as is” and “as available” basis. To the maximum extent
        permitted by law, Cambridge Building Group disclaims implied warranties, including
        implied warranties of merchantability, fitness for a particular purpose, and
        non-infringement.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Cambridge Building Group will not be liable
        for indirect, incidental, special, consequential, or punitive damages arising from use
        of the portal. Users remain responsible for reviewing accounting outputs before final
        submission.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this agreement may be sent to support@cambridgebg.com.
      </p>
    </LegalLayout>
  );
}
