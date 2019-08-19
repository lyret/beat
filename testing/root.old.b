<Root>
	<definitions>
	<// This code does nothing at the moment //>
	<@transform> 
		@from : <Foobar/>
		@to: <Foobar>
				message : [ hello world ]
			</Foobar>
	</>
	<@transform> 
		@from: <Foobar> message : { length > 10 } </Foobar>
		@to : <LongFoobarMessage> message: #target.message </LongFoobarMessage>
		@using : myScript.ts
	</>
		<Mathematical>
			<Number>@number</Number>
		</Mathematical>	
		<Geographical>
			<Longitude>
				W: [Number]
				E: [Number]
				LLL: [0...180]
				MM: [0...59]
				SS: [0...59]
				@format: {W}/{E} + {LLL}:{MM}:{SS}.
			</Longitude>
			<Position>
				longitude: [Longitude]
				latitude: [Latitude]
			</Position>
			<Landmark>
				position: [Position]
				diameter: [Number]
			</Landmark>
		</Geographical>
		
		<Atmospheric>
			<Weather>
				location: [Location]
				temprature: [Location]
				humidity: [Location]
				windspeed: [Location]
			</Weather>
		</Atmospheric>
	</Definitions>
	<Main>
		<Weather>
			city: 
				[_] Norrköping;
				[_] Mexico City;
				[_] Norrköping;
			temprature:
				20°
		</Weather>
	</Main>
</Root>