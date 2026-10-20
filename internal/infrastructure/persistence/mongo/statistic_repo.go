package mongo

import (
	"context"
	"errors"
	"fmt"
	"slices"
	"strconv"
	"strings"

	"github.com/jmoc3/Social-Network.git/internal/domain/statistic"
	"github.com/jmoc3/Social-Network.git/internal/domain/user"
	"github.com/jmoc3/Social-Network.git/internal/infrastructure/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type StatisticRepository struct {
	db     *database.MongoDatabase
	dbPost *database.PostgresDatabase
}

func NewStatisticRepository(db *database.MongoDatabase, dbPost *database.PostgresDatabase) statistic.Repository {
	return &StatisticRepository{db: db, dbPost: dbPost}
}

func (sr *StatisticRepository) FindAll(ctx context.Context) ([]*statistic.StatisticWithUser, error) {
	var statistics []*statistic.Statistic
	collection := sr.db.DB.Collection("statistics")
	cursor, err := collection.Find(ctx, &bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var statisticStruct *statistic.Statistic
		if err := cursor.Decode(&statisticStruct); err != nil {
			return nil, err
		}

		statistics = append(statistics, statisticStruct)
	}

	var usersSlice []user.UserBase
	var statisticsWithUser []*statistic.StatisticWithUser

	if len(statistics) == 0 {
		return statisticsWithUser, nil
	}

	ids := []string{}
	for _, x := range statistics {
		if !slices.Contains(ids, x.UserId) {
			ids = append(ids, x.UserId)
		}
	}

	query := "SELECT id, name, email, date_of_birth, url_image, created_at, updated_at FROM users WHERE id in (" + strings.Join(ids, ", ") + ");"
	fmt.Printf("%v\n", query)

	cursorPg, err := sr.dbPost.Conn.Query(ctx, query)

	if err != nil {
		return nil, err
	}

	defer cursorPg.Close()

	for cursorPg.Next() {
		var userData user.UserBase

		if err := cursorPg.Scan(
			&userData.Id,
			&userData.Name,
			&userData.Email,
			&userData.DateOfBirth,
			&userData.UrlImage,
			&userData.CreatedAt,
			&userData.UpdatedAt,
		); err != nil {
			return nil, err
		}

		usersSlice = append(usersSlice, userData)
	}

	for _, x := range statistics {
		idUser := slices.IndexFunc(usersSlice, func(user user.UserBase) bool {
			return strconv.Itoa(user.Id) == x.UserId
		})

		var statisticCompleted *statistic.StatisticWithUser
		statisticCompleted = &statistic.StatisticWithUser{
			Statistic: *x,
			User:      usersSlice[idUser],
		}
		statisticsWithUser = append(statisticsWithUser, statisticCompleted)
	}

	return statisticsWithUser, nil
}

func (sr *StatisticRepository) FindOne(ctx context.Context, id string) (*statistic.Statistic, error) {
	collection := sr.db.DB.Collection("statistics")
	var statistic *statistic.Statistic
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	err = collection.FindOne(ctx, bson.M{"_id": objectId}).Decode(&statistic)
	if err != nil {
		return nil, err
	}

	return statistic, nil
}

func (sr *StatisticRepository) FindByUser(ctx context.Context, userId string) ([]*statistic.Statistic, error) {
	collection := sr.db.DB.Collection("statistics")

	cursor, err := collection.Find(ctx, bson.M{"user_id": userId})
	if err != nil {
		return nil, err
	}

	defer cursor.Close(ctx)
	var statistics []*statistic.Statistic
	for cursor.Next(ctx) {
		var statistic *statistic.Statistic
		if err := cursor.Decode(&statistic); err != nil {
			return nil, err
		}

		statistics = append(statistics, statistic)
	}
	return statistics, nil
}

func (sr *StatisticRepository) Save(ctx context.Context, statistic *statistic.Statistic) (string, error) {
	collection := sr.db.DB.Collection("statistics")
	result, err := collection.InsertOne(ctx, statistic)
	if err != nil {
		return "", err
	}

	objectId, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		return "", errors.New("failed to convert inserted ID to ObjectID")
	}

	id := objectId.Hex()

	return id, nil
}

func (sr *StatisticRepository) Update(ctx context.Context, id string, statistic *statistic.Statistic) (string, error) {
	collection := sr.db.DB.Collection("statistics")
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return "", err
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": objectId}, bson.M{"$set": statistic})
	if err != nil {
		return "", err
	}

	return id, nil
}

func (sr *StatisticRepository) Delete(ctx context.Context, id string) error {
	collection := sr.db.DB.Collection("statistics")
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = collection.DeleteOne(ctx, bson.M{"_id": objectId})
	if err != nil {
		return err
	}

	return nil
}
