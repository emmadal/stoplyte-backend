if [[ $OSTYPE == 'darwin'* ]]; then
  sed -i "" "s|@db.Decimal||g" prisma/schema.prisma
  sed -i "" "s|Decimal|Float|g" prisma/schema.prisma
else
  sed -i "s|@db.Decimal||g" prisma/schema.prisma
  sed -i "s|Decimal|Float|g" prisma/schema.prisma
fi


