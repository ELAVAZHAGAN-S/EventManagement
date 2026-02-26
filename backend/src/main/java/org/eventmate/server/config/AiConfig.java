package org.eventmate.server.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * AI Configuration - Configures LangChain4j with Google Gemini
 */
@Configuration
public class AiConfig {

    @Value("${ai.gemini.api-key}")
    private String geminiApiKey;

    @Value("${ai.gemini.model-name:gemini-2.5-flash}")
    private String modelName;

    @Value("${ai.gemini.temperature:0.3}")
    private double temperature;

    @Value("${ai.gemini.max-output-tokens:1024}")
    private int maxOutputTokens;

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            throw new IllegalStateException(
                    "GEMINI_API_KEY environment variable is not set. " +
                            "Please set it in your environment or .env file. " +
                            "Get your key from: https://aistudio.google.com/app/apikey");
        }

        return GoogleAiGeminiChatModel.builder()
                .apiKey(geminiApiKey)
                .modelName(modelName)
                .temperature(temperature)
                .maxOutputTokens(maxOutputTokens)
                .build();
    }
}
