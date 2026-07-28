import React, { useState } from 'react'
import { generateAiImagePrompt } from '../utils/aiPromptGenerator'

export default function AiPromptHelperButton({
  shopName = '',
  slotName = 'Image',
  dimensions = '1920×1080',
  aspectRatio = '16:9 landscape',
  contextText = '',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const promptText = generateAiImagePrompt({
    shopName,
    slotName,
    dimensions,
    aspectRatio,
    contextText,
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3f3f3] hover:bg-[#e2e2e2] text-black text-[11px] uppercase tracking-[0.08em] font-semibold border border-[#cfc4c5] transition-colors ${className}`}
        title="Generate AI prompt for ChatGPT/Midjourney"
      >
        <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
        AI Prompt Helper
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#e2e2e2] shadow-2xl p-6 sm:p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-black text-[20px]">auto_awesome</span>
                <h3 className="font-serif text-lg text-black uppercase tracking-wider">
                  AI Image Prompt Generator
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="material-symbols-outlined text-[#7e7576] hover:text-black transition-colors text-[20px]"
              >
                close
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider font-semibold">
                <span className="bg-[#f3f3f3] px-2.5 py-1 text-[#4c4546] border border-[#e2e2e2]">
                  Slot: {slotName}
                </span>
                <span className="bg-[#f3f3f3] px-2.5 py-1 text-[#4c4546] border border-[#e2e2e2]">
                  Specs: {dimensions} ({aspectRatio})
                </span>
              </div>

              <label className="block text-[11px] uppercase tracking-[0.1em] text-[#7e7576] font-semibold">
                Generated Prompt (Ready to copy &amp; paste into ChatGPT / Midjourney / DALL-E)
              </label>

              <div className="p-4 bg-[#f9f9f9] border border-[#e2e2e2] font-mono text-xs text-[#1a1c1c] leading-relaxed select-all">
                {promptText}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 border border-[#e2e2e2] text-[11px] uppercase tracking-[0.1em] font-semibold text-[#4c4546] hover:border-black transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="px-6 py-2.5 bg-black text-white text-[11px] uppercase tracking-[0.1em] font-semibold hover:bg-[#333] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Copied to Clipboard!' : 'Copy Prompt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
