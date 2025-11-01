const { IAModel } = require('../models/IAModel');
const logger = require('../Config/logger');

// Get all IA Models
exports.getAllIAModels = async (req, res) => {
    try {
        const models = await IAModel.findAll({
            order: [['is_default', 'DESC'], ['created_at', 'DESC']]
        });
        res.json(models);
    } catch (error) {
        logger.error('Error fetching IA models:', error);
        res.status(500).json({ message: 'Error fetching IA models', error: error.message });
    }
};

// Get single IA Model by ID
exports.getIAModelById = async (req, res) => {
    try {
        const model = await IAModel.findByPk(req.params.id);
        if (!model) {
            return res.status(404).json({ message: 'IA Model not found' });
        }
        res.json(model);
    } catch (error) {
        logger.error('Error fetching IA model:', error);
        res.status(500).json({ message: 'Error fetching IA model', error: error.message });
    }
};

// Get default IA Model
exports.getDefaultIAModel = async (req, res) => {
    try {
        const model = await IAModel.findOne({ where: { is_default: true, is_active: true } });
        if (!model) {
            return res.status(404).json({ message: 'No default IA Model found' });
        }
        res.json(model);
    } catch (error) {
        logger.error('Error fetching default IA model:', error);
        res.status(500).json({ message: 'Error fetching default IA model', error: error.message });
    }
};

// Create new IA Model
exports.createIAModel = async (req, res) => {
    try {
        const { provider, models_list, selected_model, api_key, api_endpoint, prompt, is_default, is_active } = req.body;

        // If setting as default, unset other defaults
        if (is_default) {
            await IAModel.update({ is_default: false }, { where: { is_default: true } });
        }

        const newModel = await IAModel.create({
            provider,
            models_list,
            selected_model,
            api_key,
            api_endpoint,
            prompt,
            is_default: is_default || false,
            is_active: is_active !== undefined ? is_active : true
        });

        res.status(201).json(newModel);
    } catch (error) {
        logger.error('Error creating IA model:', error);
        res.status(500).json({ message: 'Error creating IA model', error: error.message });
    }
};

// Update IA Model
exports.updateIAModel = async (req, res) => {
    try {
        const { id } = req.params;
        const { provider, models_list, selected_model, api_key, api_endpoint, prompt, is_default, is_active } = req.body;

        const model = await IAModel.findByPk(id);
        if (!model) {
            return res.status(404).json({ message: 'IA Model not found' });
        }

        // If setting as default, unset other defaults
        if (is_default && !model.is_default) {
            await IAModel.update({ is_default: false }, { where: { is_default: true } });
        }

        await model.update({
            provider: provider || model.provider,
            models_list: models_list || model.models_list,
            selected_model: selected_model !== undefined ? selected_model : model.selected_model,
            api_key: api_key !== undefined ? api_key : model.api_key,
            api_endpoint: api_endpoint !== undefined ? api_endpoint : model.api_endpoint,
            prompt: prompt !== undefined ? prompt : model.prompt,
            is_default: is_default !== undefined ? is_default : model.is_default,
            is_active: is_active !== undefined ? is_active : model.is_active
        });

        res.json(model);
    } catch (error) {
        logger.error('Error updating IA model:', error);
        res.status(500).json({ message: 'Error updating IA model', error: error.message });
    }
};

// Delete IA Model
exports.deleteIAModel = async (req, res) => {
    try {
        const { id } = req.params;
        const model = await IAModel.findByPk(id);
        
        if (!model) {
            return res.status(404).json({ message: 'IA Model not found' });
        }

        await model.destroy();
        res.json({ message: 'IA Model deleted successfully' });
    } catch (error) {
        logger.error('Error deleting IA model:', error);
        res.status(500).json({ message: 'Error deleting IA model', error: error.message });
    }
};

// Translate text using the specified or default provider
exports.translateText = async (req, res) => {
    try {
        const { text, targetLanguages, providerId } = req.body;

        if (!text || !targetLanguages || !Array.isArray(targetLanguages)) {
            return res.status(400).json({ message: 'Invalid request. Provide text and targetLanguages array.' });
        }

        // Get the provider to use
        let provider;
        if (providerId) {
            provider = await IAModel.findByPk(providerId);
        } else {
            provider = await IAModel.findOne({ where: { is_default: true, is_active: true } });
        }

        if (!provider) {
            return res.status(404).json({ message: 'No AI provider found' });
        }

        // Call the appropriate translation service
        const translations = await performTranslation(provider, text, targetLanguages);

        res.json({ translations, provider: provider.provider });
    } catch (error) {
        logger.error('Error translating text:', error);
        res.status(500).json({ message: 'Error translating text', error: error.message });
    }
};

// Helper function to perform translation
async function performTranslation(provider, text, targetLanguages) {
    const translations = {};

    for (const lang of targetLanguages) {
        try {
            let translation;
            
            if (provider.provider === 'gemini') {
                translation = await translateWithGemini(provider, text, lang);
            } else if (provider.provider === 'grok') {
                translation = await translateWithGrok(provider, text, lang);
            } else if (provider.provider === 'openai') {
                translation = await translateWithOpenAI(provider, text, lang);
            } else {
                translation = `Translation not available for ${lang}`;
            }

            translations[lang] = translation;
        } catch (error) {
            logger.error(`Error translating to ${lang}:`, error);
            translations[lang] = null;
        }
    }

    return translations;
}

// Gemini translation
async function translateWithGemini(provider, text, targetLang) {
    const fetch = (await import('node-fetch')).default;
    
    // Map language codes to full names for better results
    const langMap = {
        'fr': 'French',
        'ar': 'Arabic',
        'en': 'English'
    };
    
    const targetLangName = langMap[targetLang] || targetLang;
    
    // Build the full prompt: system instruction + text to translate
    const systemPrompt = provider.prompt || 'Translate the following text to TARGET_LANG. Provide ONLY the direct translation without any introduction, explanation, quotes, or additional context.';
    const fullPrompt = `${systemPrompt.replace('TARGET_LANG', targetLangName)}\n\nText to translate: "${text}"`;
    
    logger.info(`[Gemini] Translation request - Text: "${text}", Target: ${targetLangName}`);
    logger.info(`[Gemini] Full prompt: "${fullPrompt}"`);
    
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${provider.api_key}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 0.95,
                    maxOutputTokens: 200
                }
            })
        }
    );

    if (!response.ok) {
        const error = await response.text();
        logger.error(`[Gemini] API error: ${error}`);
        throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    logger.info(`[Gemini] API Response: ${JSON.stringify(data)}`);
    
    const translation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    logger.info(`[Gemini] Translation result for ${targetLang}: "${translation}"`);
    
    return translation;
}

// Grok translation
async function translateWithGrok(provider, text, targetLang) {
    const fetch = (await import('node-fetch')).default;
    
    // Map language codes to full names
    const langMap = {
        'fr': 'French',
        'ar': 'Arabic',
        'en': 'English'
    };
    
    const targetLangName = langMap[targetLang] || targetLang;
    
    // Build the user message with the text to translate
    const systemPrompt = provider.prompt || 'Translate this text to TARGET_LANG. Return ONLY the translated text, nothing else. No quotes, no explanations.';
    const systemMessage = systemPrompt.replace('TARGET_LANG', targetLangName);

    logger.info(`[Grok] Translation request - Text: "${text}", Target: ${targetLangName}`);
    logger.info(`[Grok] System prompt: "${systemMessage}"`);

    const response = await fetch(
        'https://api.x.ai/v1/chat/completions',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.api_key}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: systemMessage
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                model: 'grok-beta',
                stream: false,
                temperature: 0.1
            })
        }
    );

    if (!response.ok) {
        const error = await response.text();
        logger.error(`[Grok] API error: ${error}`);
        throw new Error(`Grok API error: ${error}`);
    }

    const data = await response.json();
    logger.info(`[Grok] API Response: ${JSON.stringify(data)}`);
    
    const translation = data.choices?.[0]?.message?.content?.trim() || null;
    logger.info(`[Grok] Translation result for ${targetLang}: "${translation}"`);
    
    return translation;
}

// OpenAI translation (placeholder)
async function translateWithOpenAI(provider, text, targetLang) {
    const fetch = (await import('node-fetch')).default;
    
    // Map language codes to full names
    const langMap = {
        'fr': 'French',
        'ar': 'Arabic',
        'en': 'English'
    };
    
    const targetLangName = langMap[targetLang] || targetLang;
    
    // Build the system message
    const systemPrompt = provider.prompt || 'Translate to TARGET_LANG. Provide only the translation without quotes, explanations, or extra text.';
    const systemMessage = systemPrompt.replace('TARGET_LANG', targetLangName);

    logger.info(`[OpenAI] Translation request - Text: "${text}", Target: ${targetLangName}`);
    logger.info(`[OpenAI] System prompt: "${systemMessage}"`);

    const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.api_key}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: systemMessage
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.1
            })
        }
    );

    if (!response.ok) {
        const error = await response.text();
        logger.error(`[OpenAI] API error: ${error}`);
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    logger.info(`[OpenAI] API Response: ${JSON.stringify(data)}`);
    
    const translation = data.choices?.[0]?.message?.content?.trim() || null;
    logger.info(`[OpenAI] Translation result for ${targetLang}: "${translation}"`);
    
    return translation;
}
