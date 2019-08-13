<StandardLibrary>
	<Definitions>
		<Mathematical>
			<// Should be gotten from an external program environment //>
			<Number><@number/></Number>
		</Mathematical>

		<Geographical>
			<Longitude>
				W: [Number]
				E: [Number]
				LLL: [0...180]
				MM: [0...59]
				SS: <Number =>0|==0 =<90 #mathematical.number >
				@format: {W}/{E} + {LLL}:{MM}:{SS}.
			</Longitude>
			<Position>
				longitude: [Longitude]
				latitude: [Latitude]
			</Position>
			<Landmark>
				name: [_]
				position: [Position]
				diameter: [Number]
				@format: {name}
			</Landmark>
			<Location>[Landmark || Position]</Location>
		</Geographical>
		<Atmospheric>
			<Temperature>
				<Degree>[Scales:_]</Degree>
				<Scales>
					<Celsius>
						value: [Number]
						@format: {.value}°C
					</Celsius>
					<Kelvin>
						[Number]
						@format: {.}°K
					</Kelvin>
					<Fahrenheit>
						[Number]
						@format: {.}°F
					</Fahrenheit>
				</Scales>
			</Temperature>
			<Weather>
				<// State of the atmosphere //>
				location: [Location]
				temperature: [..Temperature.Degree]
			</Weather>
		</Atmospheric>

	</Definitions>
</StandardLibrary>