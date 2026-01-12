-- Add welcome_popup template to email_templates table
-- This template represents the welcome popup that shows when users first sign up

INSERT INTO public.email_templates (
  template_name,
  subject,
  html_content,
  text_content,
  description,
  variables,
  is_active
) VALUES (
  'welcome_popup',
  '🎉 Welkom bij BitBeheer!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #f97316, #ea580c); color: white; padding: 24px; border-radius: 8px 8px 0 0;">
      <h2 style="margin: 0; font-size: 24px; font-weight: bold;">🎉 Welkom bij BitBeheer!</h2>
    </div>
    
    <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">
          Hallo {{userName}}! 👋
        </h3>
        <p style="color: #4b5563; margin: 0;">
          Geweldig dat je je account hebt geactiveerd. Laat me je vertellen wat BitBeheer voor je kan betekenen.
        </p>
      </div>

      <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h4 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">
          🎯 Wat BitBeheer voor je doet:
        </h4>
        <div style="space-y: 12px;">
          <div style="display: flex; align-items: start; margin-bottom: 12px;">
            <span style="font-size: 20px; margin-right: 12px;">💡</span>
            <div>
              <h5 style="font-weight: 500; color: #1f2937; margin: 0 0 4px 0;">Persoonlijke 1-op-1 Begeleiding</h5>
              <p style="font-size: 14px; color: #4b5563; margin: 0;">Direct contact met Giovanni voor al je Bitcoin vragen</p>
            </div>
          </div>
          <div style="display: flex; align-items: start; margin-bottom: 12px;">
            <span style="font-size: 20px; margin-right: 12px;">🔐</span>
            <div>
              <h5 style="font-weight: 500; color: #1f2937; margin: 0 0 4px 0;">Veilig Bitcoin Kopen & Bewaren</h5>
              <p style="font-size: 14px; color: #4b5563; margin: 0;">Leer de beste en veiligste manieren om Bitcoin te kopen en op te slaan</p>
            </div>
          </div>
          <div style="display: flex; align-items: start; margin-bottom: 12px;">
            <span style="font-size: 20px; margin-right: 12px;">📊</span>
            <div>
              <h5 style="font-weight: 500; color: #1f2937; margin: 0 0 4px 0;">Eigen beheer</h5>
              <p style="font-size: 14px; color: #4b5563; margin: 0;">24/7 wallet waarde, verkopen wanneer je wilt, 100% controle</p>
            </div>
          </div>
          <div style="display: flex; align-items: start;">
            <span style="font-size: 20px; margin-right: 12px;">🛠️</span>
            <div>
              <h5 style="font-weight: 500; color: #1f2937; margin: 0 0 4px 0;">Tools & Resources</h5>
              <p style="font-size: 14px; color: #4b5563; margin: 0;">Je kennis opdoen van amatuer naar ervaren Bitcoin belegger</p>
            </div>
          </div>
        </div>
      </div>

      <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h4 style="font-size: 18px; font-weight: 600; color: #9a3412; margin-bottom: 12px;">
          🚀 Volgende Stappen:
        </h4>
        <ol style="padding-left: 20px; margin: 0; color: #7c2d12;">
          <li style="margin-bottom: 8px;">Verken je dashboard en de beschikbare tools</li>
          <li style="margin-bottom: 8px;">Plan een kennismakingsgesprek met Giovanni</li>
          <li style="margin-bottom: 8px;">Stel je Bitcoin investeringsdoelen vast</li>
          <li>Begin met veilig Bitcoin kopen en bewaren</li>
        </ol>
      </div>

      <div style="text-align: center; background: #f3f4f6; border-radius: 8px; padding: 16px;">
        <h4 style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">💬 Direct Contact</h4>
        <p style="font-size: 14px; color: #4b5563; margin-bottom: 8px;">
          Heb je vragen? Giovanni staat klaar om je te helpen!
        </p>
        <div style="display: flex; justify-content: center; gap: 16px; font-size: 14px;">
          <span style="color: #ea580c; font-weight: 500;">📧 info@bitbeheer.nl</span>
          <span style="color: #ea580c; font-weight: 500;">🌐 bitbeheer.nl</span>
        </div>
      </div>
    </div>
  </div>',
  '🎉 Welkom bij BitBeheer!

Hallo {{userName}}! 👋

Geweldig dat je je account hebt geactiveerd. Laat me je vertellen wat BitBeheer voor je kan betekenen.

🎯 Wat BitBeheer voor je doet:

💡 Persoonlijke 1-op-1 Begeleiding
Direct contact met Giovanni voor al je Bitcoin vragen

🔐 Veilig Bitcoin Kopen & Bewaren
Leer de beste en veiligste manieren om Bitcoin te kopen en op te slaan

📊 Eigen beheer
24/7 wallet waarde, verkopen wanneer je wilt, 100% controle

🛠️ Tools & Resources
Je kennis opdoen van amatuer naar ervaren Bitcoin belegger

🚀 Volgende Stappen:
1. Verken je dashboard en de beschikbare tools
2. Plan een kennismakingsgesprek met Giovanni
3. Stel je Bitcoin investeringsdoelen vast
4. Begin met veilig Bitcoin kopen en bewaren

💬 Direct Contact
Heb je vragen? Giovanni staat klaar om je te helpen!
📧 info@bitbeheer.nl
🌐 bitbeheer.nl',
  'Welkomst popup die wordt getoond bij eerste inlog na aanmelding',
  '{"userName": "Naam van de gebruiker"}'::jsonb,
  true
)
ON CONFLICT (template_name) 
DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  text_content = EXCLUDED.text_content,
  description = EXCLUDED.description,
  variables = EXCLUDED.variables,
  updated_at = NOW();

