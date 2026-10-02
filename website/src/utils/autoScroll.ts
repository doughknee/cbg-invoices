export function scrollToNextSection(el: string): void {
  if (typeof document === 'undefined') return
  const nextSectionEl = document.getElementById(el)
  nextSectionEl?.scrollIntoView({ behavior: 'smooth' })
}
