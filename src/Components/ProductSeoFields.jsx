import React, { useState } from "react";
import { toast } from "react-toastify";

const SEO_FIELDS = [
  {
    name: "seoFocusKeyword",
    label: "Focus Keyword",
    type: "input",
    placeholder: "e.g. ceramic dinner set Bangladesh",
    help: "Main phrase you want this page to rank for.",
  },
  {
    name: "seoTitle",
    label: "SEO Title (Meta Title)",
    type: "input",
    placeholder: "e.g. Ceramic Dinner Sets | Monorom",
    help: "Ideal length ~50–60 characters. Shown as the blue link title in Google.",
    maxLength: 70,
    counterMax: 60,
  },
  {
    name: "seoDescription",
    label: "Meta Description",
    type: "textarea",
    placeholder:
      "Short compelling summary with your focus keyword and a call to action...",
    help: "Ideal length ~150–160 characters. Shown under the title in Google.",
    maxLength: 180,
    counterMax: 160,
  },
  {
    name: "seoKeywords",
    label: "SEO Keywords",
    type: "input",
    placeholder: "dinner set, ceramic plates, dinnerware Bangladesh",
    help: "Comma-separated related keywords (optional; use sparingly).",
  },
];

/**
 * Shared SEO fields + per-field AI generate.
 * @param {string} generateEndpoint - full API path after backend URL, e.g. /api/ai/product/generateSeo
 * @param {function} buildPayload - (field) => request body object
 * @param {string} nameMissingMessage
 */
const ProductSeoFields = ({
  formData,
  onChange,
  onFieldUpdate,
  generateEndpoint = "/api/ai/product/generateSeo",
  buildPayload,
  nameMissingMessage = "Enter the name first, then generate SEO.",
}) => {
  const [loadingField, setLoadingField] = useState(null);

  const generateField = async (field) => {
    if (!formData?.name?.trim()) {
      toast.error(nameMissingMessage);
      return;
    }

    setLoadingField(field);
    try {
      const payload =
        typeof buildPayload === "function"
          ? buildPayload(field)
          : {
              field,
              name: formData.name,
              productCode: formData.productCode,
              categoryName: formData.categoryName,
              desc: formData.desc,
              specialLines: formData.specialLines,
              price: formData.price,
              seoFocusKeyword: formData.seoFocusKeyword,
              seoTitle: formData.seoTitle,
              seoDescription: formData.seoDescription,
              seoKeywords: formData.seoKeywords,
            };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}${generateEndpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate SEO");
      }

      if (typeof onFieldUpdate === "function") {
        onFieldUpdate(field, data.value || "");
      } else {
        onChange({ target: { name: field, value: data.value || "" } });
      }
      toast.success(
        `${SEO_FIELDS.find((f) => f.name === field)?.label || "SEO"} generated`
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message || "AI generation failed. Try again.");
    } finally {
      setLoadingField(null);
    }
  };

  return (
    <div className="rounded-lg border border-base-300 bg-base-200/40 p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">SEO Settings</h3>
        <p className="text-sm text-base-content/60 mt-1">
          These appear in Google search results and social previews. Leave blank to
          use defaults — or generate with AI.
        </p>
        <p className="text-xs text-base-content/50 mt-1">
          Tip: Generate Focus Keyword first, then Title, Description, and Keywords.
        </p>
      </div>

      {SEO_FIELDS.map((field) => (
        <div key={field.name}>
          <label className="label">
            <span className="label-text">{field.label}</span>
            {field.counterMax != null && (
              <span className="label-text-alt">
                {(formData[field.name] || "").length}/{field.counterMax}
              </span>
            )}
          </label>

          {field.type === "textarea" ? (
            <textarea
              name={field.name}
              value={formData[field.name] || ""}
              onChange={onChange}
              className="textarea textarea-bordered w-full min-h-[100px]"
              placeholder={field.placeholder}
              maxLength={field.maxLength}
            />
          ) : (
            <input
              type="text"
              name={field.name}
              value={formData[field.name] || ""}
              onChange={onChange}
              className="input input-bordered w-full"
              placeholder={field.placeholder}
              maxLength={field.maxLength}
            />
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              disabled={loadingField !== null}
              onClick={() => generateField(field.name)}
            >
              {loadingField === field.name ? (
                <span className="loading loading-spinner loading-xs" />
              ) : null}
              {loadingField === field.name
                ? "Generating..."
                : "Generate with AI ✨"}
            </button>
            <p className="text-xs text-base-content/50">{field.help}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSeoFields;
