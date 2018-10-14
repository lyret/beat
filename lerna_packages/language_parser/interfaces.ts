
export interface BeatProblem {
	name: string,
	message: string
	token: {
		image?: string
		startOffset: number
		endOffset: number
		startLine: number
		endLine: number
		startColumn: number
		endColumn: number
		tokenTypeIdx?: number
		tokenType?: any 
	}
	previousToken?: any
}