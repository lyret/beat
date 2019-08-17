{ =any }
card: [
	name: { =string } []
	value: { =number } []
	quantity: { =number } 8
]

cards: { ::(card) } [
	[ name: Four; value: 5; ]
	[ name: Five; value: 5; ]
	[ name: Six; value: 5; ]
	[ name: Seven; value: 5; ]
	[ name: Eigth; value: 10; ]
	[ name: Nine; value: 10; ]
	[ name: Ten; value: 10; ]
	[ name: Jack; value: 10; ]
	[ name: Dame; value: 10; ]
	[ name: Queen; value: 10; ]
	[ name: King; value: 10; ]
	[ name: Ace; value: 20; ]
	[ name: Two; value: 10; ]
	[ name: BlackThree; value: 5; quantity: 4 ]
	[ name: RedThree; value: 5; quantity: 4 ]
	[ name: Joker; value: 50; quantity: 4 ]
]

game: [
	finished: {=bool} false
	locked: {=bool} false
	player: (players.0)
	players: [
		[ name: olsson; hand: {l(card)} [] ]
		[ name: lyret; hand: {l(card)} [] ]
		[ name: anders; hand: {l(card)} [] ]
		[ name: david; hand: {l(card)} [] ]
	]
	deck: { ::(card) } []
	pile: { ::(card) } []
	moves: { =string } []
]

@discard: [
	-> game: { =(..game) } (..game)
	-> card: { =(game.player.hand.#selected) } (game.player.hand.#selected)
	=> [
		...(game)
		player: [ 
			...(game.player)
			hand: [
				{ !=(card) } ..(game.player.hand)
			 ]
		]
		/ re-adds the pile with the discared card on top /
		pile: [
			/ the added card /
			(card)
			/ the rest of the pile /
			...(game.pile.*)
		]
	]
]