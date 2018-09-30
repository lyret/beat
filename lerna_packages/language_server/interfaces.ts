/** Language Server Settings */
interface LanguageServerSettings {
	maxNumberOfProblems: number
}

/** Language Server Capabilities */
interface ServerCapabilities {
	hasConfigurationCapability: boolean
	hasWorkspaceFolderCapability: boolean
	hasDiagnosticRelatedInformationCapability: boolean
}

/** 
 * Language Server Runtime
 * keeps the current capabilities and configuration of the server
 */
interface ServerRuntime extends ServerCapabilities {
	/** global settings */
	globalSettings: LanguageServerSettings
	/** Settings cache for all open documents */
	documentSettings: Map<string, Thenable<LanguageServerSettings>>
}