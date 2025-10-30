import React from "react";

function PersonalDetailPreview({ resumeInfo }) {
  const theme = resumeInfo?.themeColor || "#111";

  // derived fields with sensible fallbacks
  const jobTitle =
    resumeInfo?.jobTitle || resumeInfo?.designation || resumeInfo?.title;
  const address =
    resumeInfo?.address ||
    resumeInfo?.location ||
    (resumeInfo?.city && resumeInfo?.state
      ? `${resumeInfo.city}, ${resumeInfo.state}`
      : resumeInfo?.city || resumeInfo?.state);

  const contacts = [
    {
      key: "username",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z" />
        </svg>
      ),
      value: resumeInfo?.username,
    },
    // address / location contact
    {
      key: "address",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
        </svg>
      ),
      value: address,
    },
    {
      key: "linkedin",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M4.98 3.5A2.5 2.5 0 102.5 6 2.5 2.5 0 004.98 3.5zM3 8.98h4v11H3v-11zm7 0h3.7v1.5h.05c.52-.98 1.8-2 3.7-2 4 0 4.7 2.64 4.7 6.07V21h-4v-5.1c0-1.22 0-2.78-1.7-2.78-1.7 0-1.96 1.32-1.96 2.68V21h-4v-11z" />
        </svg>
      ),
      value: resumeInfo?.linkedin,
      href: resumeInfo?.linkedin,
    },
    {
      key: "website",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 2.1V6h-2V4.1a8 8 0 014 0zM6.6 7.2l1.2 1.2A7.9 7.9 0 006 12c0-.9.18-1.8.6-4.8zM12 20a8 8 0 01-4.8-1.6l1.2-1.2A6 6 0 0012 18v2z" />
        </svg>
      ),
      value: resumeInfo?.website,
      href:
        resumeInfo?.website &&
        (resumeInfo.website.startsWith("http")
          ? resumeInfo.website
          : `https://${resumeInfo.website}`),
    },
    {
      key: "email",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M2 6v12h20V6l-10 6L2 6zm10 4L22 6H2l10 4z" />
        </svg>
      ),
      value: resumeInfo?.email,
      href: resumeInfo?.email && `mailto:${resumeInfo.email}`,
    },
    {
      key: "phone",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l1.8-1.8a1 1 0 011.1-.2c1.2.5 2.6.8 4 .8a1 1 0 011 1V20a1 1 0 01-1 1C9.4 21 3 14.6 3 6a1 1 0 011-1h2.5a1 1 0 011 1c0 1.4.3 2.8.8 4 .2.4 0 .9-.2 1.1l-1.5 1.7z" />
        </svg>
      ),
      value: resumeInfo?.phone,
      href: resumeInfo?.phone && `tel:${resumeInfo.phone}`,
    },
  ].filter((c) => c.value);

  return (
    <header className="mb-4">
      <div className="text-center">
        <h1
          className="font-serif font-semibold text-3xl"
          style={{ color: theme }}
        >
          {resumeInfo?.firstName} {resumeInfo?.lastName}
        </h1>

        {jobTitle && (
          <div
            className="text-sm mt-1 font-medium"
            style={{ color: "#4b5563" /* slate-600 */ }}
          >
            {jobTitle}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs text-slate-700">
          {contacts.map((c, i) => (
            <div key={c.key} className="flex items-center gap-2">
              <span className="text-[0.85rem]" style={{ color: theme }}>
                {c.icon}
              </span>
              {c.href ? (
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {c.value}
                </a>
              ) : (
                <span>{c.value}</span>
              )}
              {i < contacts.length - 1 && (
                <span className="mx-2 text-slate-400">|</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <hr
        className="border-t mt-4"
        style={{ borderColor: theme, borderWidth: "1px" }}
      />
    </header>
  );
}

export default PersonalDetailPreview;
